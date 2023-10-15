import React, { useState } from "react";
import cn from "classnames";
import * as uuid from "uuidv4";
import moment from "moment";
import styles from "./Register.module.sass";
import Control from "../../components/Control";
import TextInput from "../../components/TextInput";
import Icon from "../../components/Icon";
import { generateKeyPair } from "../../utils/did";
import { DID, Lac1DID } from "@lacchain/did";
import { createKeyPair } from "@lacchain/did/lib/utils";
import { sendVC } from "../../utils/mailbox";
import { registerCredentialMock } from "../../utils/credentials";
import { useAuthContext } from "../../contexts/authContext";
import { Link, Redirect } from "react-router-dom";
import LoaderCircle from "../../components/LoaderCircle";
import Modal from "../../components/Modal";
import {
  LAC1_CHAIN_ID,
  LAC1_DID_REGISTRY,
  LAC_DID_NETWORK_IDENTIFIER,
  LAC_DID_REGISTTRY,
  NODE_ADDRESS,
  RPC_URL,
} from "../../constants/env";

const breadcrumbs = [
  {
    title: "Import",
    url: "/import",
  },
  {
    title: "Register",
  },
];

const Register = ({ history }) => {
  const [firstName, setFirstName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);

  const { provider, authorizing, user: currentUser, signin } = useAuthContext();
  if (!authorizing && currentUser) return <Redirect to="/" replace />;

  const handleSubmit = async () => {
    if (!provider) {
      if (!password) return setError("Password is empty");
      if (password !== repassword)
        return setError("Both password must be equal");
    }
    setSending(true);
    const encryptionKeyPair = await generateKeyPair();
    const controllerKeyPair = createKeyPair();
    let did;
    if (process.env.REACT_APP_DID_METHOD === "lac1") {
      did = await Lac1DID.new({
        registry: LAC1_DID_REGISTRY,
        rpcUrl: RPC_URL,
        network: LAC_DID_NETWORK_IDENTIFIER,
        nodeAddress: NODE_ADDRESS,
        expiration: Math.floor(new Date().getTime() / 1000) + 3600 * 24 * 5,
        chainId: LAC1_CHAIN_ID,
      });
    } else {
      did = new DID({
        registry: LAC_DID_REGISTTRY,
        rpcUrl: RPC_URL,
        network: LAC_DID_NETWORK_IDENTIFIER,
        nodeAddress: NODE_ADDRESS,
        expiration: Math.floor(new Date().getTime() / 1000) + 3600 * 24 * 5,
      });
    }
    await did.addController(controllerKeyPair.address);
    setStep(1);
    await did.addKeyAgreement({
      algorithm: "x25519ka",
      encoding: "hex",
      publicKey: `0x${encryptionKeyPair.publicKey}`,
      controller: did.address,
    });
    await did.addAuthenticationMethod({
      algorithm: "esecp256k1vk",
      encoding: "blockchain",
      publicKey: did.address,
      controller: did.address,
    });
    setStep(2);
    await did.changeController(controllerKeyPair.address);

    const user = {
      did: did.id,
      mainKeyPair: { privateKey: did.config.controllerPrivateKey },
      controllerKeyPair,
      encryptionKeyPair,
    };

    // TODO: create on fly issuer
    setStep(3);
    const vc = {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://credentials-library.lacchain.net/credentials/identity/v2",
      ],
      id: uuid.uuid(),
      type: ["VerifiableCredential", "IdentityCard"],
      validFrom: moment().toISOString(),
      validUntil: moment().add(2, "years").toISOString(),
      credentialSubject: {
        id: did.id,
        givenName: firstName,
        familyName: familyName,
        email: email,
      },
    };
    const identityVC = await registerCredentialMock(vc, "type-2");
    setStep(4);
    await sendVC(user, user.did, identityVC.vc);
    user.credentials = [identityVC.vc];
    setStep(5);
    if (provider) await signin(user);
    else await signin(user, email, password);
    setSending(false);
    history.push("/");
  };

  return (
    <div className={styles.page}>
      <Control className={styles.control} item={breadcrumbs} />
      <div className={cn("section-pb", styles.section)}>
        <div className={cn("container", styles.container)}>
          {sending && (
            <Modal visible={true} closable={false}>
              <div className={styles.line}>
                <div className={styles.icon}>
                  <LoaderCircle className={styles.loader} />
                </div>
                <div className={styles.details}>
                  <div className={styles.subtitle}>Creating new account</div>
                  <div className={styles.text}>
                    <ul>
                      {step >= 0 && (
                        <li>
                          <Icon name="check" size="16" /> Generating a new DID
                        </li>
                      )}
                      {step >= 1 && (
                        <li>
                          <Icon name="check" size="16" /> Registering Public
                          Keys
                        </li>
                      )}
                      {step >= 2 && (
                        <li>
                          <Icon name="check" size="16" /> Changing Controller
                        </li>
                      )}
                      {step >= 3 && (
                        <li>
                          <Icon name="check" size="16" /> Signing LACChain ID
                          Credential
                        </li>
                      )}
                      {step >= 4 && (
                        <li>
                          <Icon name="check" size="16" /> Sending LACChain ID
                          Credential
                        </li>
                      )}
                      {step >= 5 && (
                        <li>
                          <Icon name="check" size="16" /> Encrypting Data
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </Modal>
          )}
          <div className={styles.top}>
            <h3 className={cn("h4", styles.title)}>Create new account</h3>
            <div className={styles.info}>
              You need to provide your name and email to create an account. If
              you already have a backup copy of your wallet, then you can{" "}
              <Link to="/import">
                <strong>import</strong>
              </Link>{" "}
              instead.
              {error && <div className={styles.error}>{error}</div>}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.list}>
                <div className={styles.item}>
                  <div className={styles.category}>User info</div>
                  <div className={styles.fieldset}>
                    <TextInput
                      className={styles.field}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      label="first name"
                      name="First Name"
                      type="text"
                      placeholder="Enter your first name"
                      required
                    />
                    <TextInput
                      className={styles.field}
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      label="family name"
                      name="Family Name"
                      type="text"
                      placeholder="Enter your family name"
                      required
                    />
                  </div>
                  <div className={styles.fieldset}>
                    <TextInput
                      className={styles.field}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      label="last name"
                      name="Last Name"
                      type="text"
                      placeholder="Enter your last name"
                      required
                    />
                    <TextInput
                      className={styles.field}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      label="email"
                      name="Email"
                      type="email"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                {!provider && (
                  <div className={styles.item}>
                    <div className={styles.category}>Account Info</div>
                    <div className={styles.fieldset}>
                      <TextInput
                        className={styles.field}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="password"
                        name="Password"
                        type="password"
                        placeholder="Enter your password"
                        required
                      />
                      <TextInput
                        className={styles.field}
                        value={repassword}
                        onChange={(e) => setRepassword(e.target.value)}
                        label="Re-password"
                        name="Re-Password"
                        type="password"
                        placeholder="Enter your password again"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.note}>
                To create your account you should encrypt the data through your
                wallet (Metamask). Click <strong>Create account</strong> to
                encrypt the account data in the local storage.
              </div>
              <div className={styles.btns}>
                <button
                  className={cn("button", styles.button)}
                  onClick={handleSubmit}
                >
                  Create account
                </button>
                <button className={styles.clear}>
                  <Icon name="circle-close" size="24" />
                  Clear all
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

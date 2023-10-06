import React, { useState } from "react";
import cn from "classnames";
import styles from "./Burn.module.sass";
import SelectClaims from "./SelectClaims";
import {
  deriveCredential,
  toQRCode,
} from "../../utils/CredentialVerificationUtils";
import { presentCredential } from "../../utils/credentials";
import { useAuthContext } from "../../contexts/authContext";

const Presentation = ({ className, credential }) => {
  const claimNames = Object.keys(credential.credentialSubject || {});
  const [qr, setQRCode] = useState("");
  const [selected, setSelected] = useState(claimNames);
  const { user } = useAuthContext();

  return (
    <div className={cn(className, styles.transfer)}>
      <div className={cn("h4", styles.title)}>Presentation</div>
      <div className={styles.text}>
        To generate a Verifiable Presentation with Selective Disclosure
        (Zero-Knowledge Proof), please select the fields to include:
        <p style={{ marginTop: "15px" }}>
          {!qr && (
            <SelectClaims
              claims={credential.credentialSubject}
              selected={selected}
              setSelected={setSelected}
            />
          )}
          {qr && <img src={qr} alt="QR Code" width="100%" />}
        </p>
      </div>
      <div className={styles.btns}>
        {!qr && (
          <button
            className={cn("button-pink", styles.button)}
            onClick={() => {
              deriveCredential(credential, selected).then(async (zkp) => {
                const vp = presentCredential(zkp, user);
                const qr = await toQRCode(vp);
                setQRCode(qr);
              });
            }}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default Presentation;

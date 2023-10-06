import React, { useState } from "react";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Actions.module.sass";
import SendCredential from "../SendCredential";
import RemoveSale from "../RemoveSale";
import Report from "../Report";
import Icon from "../Icon";
import Modal from "../../components/Modal";
import {
  type2VerifyCredential,
  resolveRootOfTrust,
  toQRCode,
  type1VerifyCredential,
} from "../../utils/CredentialVerificationUtils";
import {
  Type1CredentialVerfication,
  Type2CredentialVerfication,
  Wait,
} from "../../screens/Item/Control/CredentialVerfication";
import Presentation from "../Presentation";

const Actions = ({ className, item, attachment }) => {
  const [visible, setVisible] = useState(false);
  const [visibleModalTransfer, setVisibleModalTransfer] = useState(false);
  const [visibleModalRemoveSale, setVisibleModalRemoveSale] = useState(false);
  const [visibleModalBurn, setVisibleModalBurn] = useState(false);
  const [visibleModalReport, setVisibleModalReport] = useState(false);
  const [visibleHealthQr, setVisibleHealthQr] = useState(false);

  const [visibleModalVerification, setVisibleModalVerification] =
    useState(false);
  const [verification, setVerification] = useState({});
  const [verifying, setVerifying] = useState(false);
  const [isType1Verification, setIsType1Verification] = useState(false);
  const [isType2Verification, setIsType2Verification] = useState(false);

  const [qrCode, setQRCode] = useState("");
  const [healthQrcode, setHealthQRCode] = useState("");

  const items = [
    {
      title: "Send Credential",
      icon: "share",
      action: () => setVisibleModalTransfer(true),
    },
    {
      title: "Verify Credential",
      icon: "check",
      action: async () => {
        setVerifying(true);
        setVisibleModalVerification(true);
        const verificationResponse = await type2VerifyCredential(
          item,
          item.proof
        );
        let verification;
        let isType1Verification = false;
        let isType2Verification = false;
        if (!verificationResponse.error) {
          verification = verificationResponse.data;
          isType2Verification = true;
        } else {
          const verificationResult = await type1VerifyCredential(item);
          if (verificationResult.error) {
            console.log("ERROR:: ", verificationResult.message);
            setVerifying(false);
            return;
          }
          verification = verificationResult.data;
          isType1Verification = true;
        }
        // TODO: improve, avoid passing proofs
        const rotResponse = await resolveRootOfTrust(
          item.issuer,
          item.trustedList,
          item.proof
        );
        if (rotResponse.error) {
          console.log("ERROR:: ", rotResponse.message);
          setVerifying(false);
          return;
        }
        const retrievedTrustTree = rotResponse.data.trustTree;
        const isTrusted =
          retrievedTrustTree.length > 0 &&
          retrievedTrustTree[retrievedTrustTree.length - 1];
        setVerification({ ...verification, isTrusted });
        if (isType1Verification) setIsType1Verification(isType1Verification);
        if (isType2Verification) setIsType2Verification(isType2Verification);
        setVerifying(false);
      },
    },
  ];

  const blsInProofArray =
    Array.isArray(item.proof) &&
    item.proof?.find((p) => p.type === "BbsBlsSignature2020");
  const blsInProof =
    !Array.isArray(item.proof) && item.type === "BbsBlsSignature2020";

  if (blsInProofArray || blsInProof)
    items.push({
      title: "Create Presentation",
      icon: "edit",
      action: () => setVisibleModalBurn(true),
    });
  if (attachment)
    items.push({
      title: "Download Attachment",
      icon: "more",
      action: () => {
        const url = "data:application/pdf;base64," + attachment;
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "attachment.pdf");
        document.body.appendChild(link);
        link.click();
      },
    });

  const isHealthCredentialType2 =
    item &&
    typeof item["@context"] === "object" &&
    item["@context"].find(
      (el) =>
        el ===
        "https://credentials-library.lacchain.net/credentials/health/vaccination/v3"
    );
  const isHealthImage =
    item &&
    item.credentialSubject &&
    item.credentialSubject.image &&
    item.credentialSubject.image
      ? item.credentialSubject.image
      : null;
  if (isHealthCredentialType2 && isHealthImage) {
    items.push({
      title: "Show Health QR Code",
      icon: "report",
      action: () => {
        setHealthQRCode(
          `data:image/png;base64,${item.credentialSubject.image.contentUrl}`
        );
        setVisibleHealthQr(true);
      },
    });
  } else {
    items.push({
      title: "Show QR Code",
      icon: "report",
      action: () => {
        toQRCode(item).then((qr) => {
          setQRCode(qr);
          setVisibleModalReport(true);
        });
      },
    });
  }

  return (
    <>
      <OutsideClickHandler onOutsideClick={() => {}}>
        <div
          className={cn(styles.actions, className, {
            [styles.active]: true,
          })}
        >
          <div className={styles.body}>
            <div className={styles.item} onClick={() => setVisible(!visible)}>
              <span>{visible ? "Hide" : "Show"} options</span>
            </div>
            {visible &&
              items.map((x, index) => (
                <div className={styles.item} key={index} onClick={x.action}>
                  <Icon name={x.icon} size="20" />
                  <span>{x.title}</span>
                </div>
              ))}
          </div>
        </div>
      </OutsideClickHandler>
      <Modal
        visible={visibleHealthQr}
        onClose={() => setVisibleHealthQr(false)}
      >
        <Report qr={healthQrcode} />
      </Modal>
      <Modal
        visible={visibleModalTransfer}
        onClose={() => setVisibleModalTransfer(false)}
      >
        <SendCredential
          credential={item}
          onFinish={() => setVisibleModalTransfer(false)}
        />
      </Modal>
      <Modal
        visible={visibleModalRemoveSale}
        onClose={() => setVisibleModalRemoveSale(false)}
      >
        <RemoveSale />
      </Modal>
      <Modal
        visible={visibleModalBurn}
        onClose={() => setVisibleModalBurn(false)}
      >
        <Presentation credential={item} />
      </Modal>
      <Modal
        visible={visibleModalReport}
        onClose={() => setVisibleModalReport(false)}
      >
        <Report qr={qrCode} />
      </Modal>
      <Modal
        visible={visibleModalVerification}
        onClose={() => setVisibleModalVerification(false)}
      >
        {verifying ? <Wait /> : null}
        {isType1Verification ? (
          <Type1CredentialVerfication results={verification || {}} />
        ) : null}
        {isType2Verification ? (
          <Type2CredentialVerfication results={verification || {}} />
        ) : null}
      </Modal>
    </>
  );
};

export default Actions;

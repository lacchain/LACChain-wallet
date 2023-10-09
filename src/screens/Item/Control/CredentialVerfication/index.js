import React from "react";
import cn from "classnames";
import styles from "./CredentialVerfication.module.sass";
import Icon from "../../../../components/Icon";
import LoaderCircle from "../../../../components/LoaderCircle";

const STEP_CATALOG = {
  credentialExists: {
    key: "credentialExists",
    successTitle: "Credential registered",
    successSubtitle: "The credential is registered in the registry",
    failedTitle: "Credential is not registered",
    failedSubtitle: "The credential is not registered in the registry",
  },
  isNotRevoked: {
    key: "isNotRevoked",
    successTitle: "Credential is not revoked",
    successSubtitle: "The credential has not been revoked",
    failedTitle: "Credential is revoked",
    failedSubtitle: "The credential has been revoked",
  },
  issuerSignatureValid: {
    key: "issuerSignatureValid",
    successTitle: "Issuer signature valid",
    successSubtitle: "The issuer proof is valid",
    failedTitle: "Issuer signature invalid",
    failedSubtitle: "The issuer proof is not valid",
  },
  additionalSigners: {
    key: "additionalSigners",
    successTitle: "Additional signatures",
    successSubtitle: "The additional signatures are present and valid",
    failedTitle: "Missing signatures",
    failedSubtitle:
      "The additional signatures are not present or they are invalid",
  },
  isNotExpired: {
    key: "isNotExpired",
    successTitle: "Is not expired",
    successSubtitle: "The credential is within the validity period",
    failedTitle: "Expired",
    failedSubtitle: "The credential has been expired",
  },
  isTrusted: {
    key: "isTrusted",
    successTitle: "The issuer is trusted",
    successSubtitle: "The issuer Root of Trust is valid",
    failedTitle: "The issuer is not trusted",
    failedSubtitle: "The issuer Root of Trust is not valid",
  },
};

const TYPE_1_VERIFICATION_STEPS = [
  STEP_CATALOG.credentialExists,
  STEP_CATALOG.isNotRevoked,
  STEP_CATALOG.issuerSignatureValid,
  STEP_CATALOG.additionalSigners,
  STEP_CATALOG.isNotExpired,
  STEP_CATALOG.isTrusted,
];

const TYPE_2_VERIFICATION_STEPS = [
  STEP_CATALOG.isNotRevoked,
  STEP_CATALOG.issuerSignatureValid,
  STEP_CATALOG.isNotExpired,
  STEP_CATALOG.isTrusted,
];

export const Wait = ({ className }) => {
  return (
    <div className={cn(className, styles.checkout)}>
      <div className={cn("h4", styles.title)}>Verification</div>
      <div className={styles.line}>
        <div className={styles.icon}>
          <LoaderCircle className={styles.loader} />
        </div>
        <div className={styles.details}>
          <div className={styles.subtitle}>Verifying</div>
          <div className={styles.text}>The credential is being verified</div>
        </div>
      </div>
    </div>
  );
};

// TODO: Improve, when property is not defined it means the system was unable to verify that check so it must be 
// visually expressed rather than showing as invalid.
const CredentialVerfication = ({ className, results, typeToRender }) => {
  const steps =
    typeToRender === "type1"
      ? TYPE_1_VERIFICATION_STEPS
      : TYPE_2_VERIFICATION_STEPS;
  return (
    <div className={cn(className, styles.checkout)}>
      <div className={cn("h4", styles.title)}>Verification</div>
      {steps.map((step) => (
        <div
          className={results[step.key] ? styles.correct : styles.attention}
          key={step.key}
        >
          <div className={styles.preview}>
            {results[step.key] ? (
              <Icon name="check" size="32" />
            ) : (
              <Icon name="info-circle" size="32" />
            )}
          </div>
          <div className={styles.details}>
            <div className={styles.subtitle}>
              {results[step.key] ? step.successTitle : step.failedTitle}
            </div>
            <div className={styles.text}>
              {results[step.key] ? step.successSubtitle : step.failedSubtitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const Type1CredentialVerfication = ({ className, results }) => {
  return (
    <CredentialVerfication
      className={className}
      results={results}
      typeToRender={"type1"}
    />
  );
};

export const Type2CredentialVerfication = ({ className, results }) => {
	return (
	  <CredentialVerfication
		className={className}
		results={results}
		typeToRender={"type2"}
	  />
	);
  };



export default CredentialVerfication;

import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import { Document, Page } from 'react-pdf/dist/entry.webpack';
import styles from './Item.module.sass';
import Proofs from './Proofs';
import Claims from './Claims';
import Options from './Options';
import { types } from '../../mocks/types';
import { issuers } from '../../mocks/issuers';
import Raw from './Raw';
import {
  getRootOfTrust,
  toEUCertificate,
  verifyCredential,
  verifyRootOfTrust,
  verifySignature,
} from '../../utils/CredentialVerificationUtils';
import RootOfTrust from './RootOfTrust';
import { useAuthContext } from '../../contexts/authContext';
import { getBalance as getERC20Balance } from '../../utils/erc20';
import { getBalance as getNFTBalance } from '../../utils/erc721';
import { getBalance as getTokenizedBalance } from '../../utils/tokenized';

import {
  GetPdfFromCredential,
  validateVaccinationCertificateV2VerifiableCredential,
} from './VcToPdf';
import { tryDecodeDomain } from '../../utils/domainType0001';
import { getPublicDirectoryMember } from '../../utils/type2Credential/PublicDirectory';
import { resolveRootOfTrustByDomain } from '../../utils/type2Credential/rootOfTrust';

const navLinks = [
  { name: 'Claims', index: 0 },
  { name: 'Proofs', index: 1 },
  { name: 'Root of Trust', index: 2 },
  { name: 'Raw', index: 3 },
  { name: 'EU', index: 4 },
];

const keyType = {
  EcdsaSecp256k1Signature2019: 'Ethereum SECP256K Signature',
  RsaSignature2018: 'RSA X.509 Signature',
  BbsBlsSignature2020: 'ZKP BBS+ Signature',
};

async function resolveIssuer(did, domain = undefined) {
  if (issuers[did]) {
    return issuers[did];
  }
  if (!domain) {
    return issuers.unknown;
  }
  // try to resolve public directory from domain
  const { error, data } = tryDecodeDomain(domain);
  if (error) {
    return issuers.unknown;
  }
  const member = await getPublicDirectoryMember(
    data.publicDirectoryContractAddress,
    did,
    data.chainId,
  ); // TODO: data: appear as error on hovering
  if (member.error || !member.data.isMember) {
    console.log(`resolveIssuer: ${member.message}`);
    return issuers.unknown; // TODO: handle view with error
  }

  if (!member.data.legalName) {
    return issuers.generic; // TODO: finish logic correctly
  }

  return {
    name: member.data.legalName,
    avatar: issuers.generic.avatar,
  };
}

/**
 * Depending of the type of verifiable credential, this method will validate the signature
 * and will check whether the signer is known according to some trusted public directory that this repository trusts.
 * @param {*} credential
 * @returns
 */
async function verifyCredentialAndResolveIssuer(credential) {
  // normalize proofs to array
  if (credential && !Array.isArray(credential.proof)) {
    credential.proof = [credential.proof];
  }
  const proofs = [];
  const verificationResponse = await verifyCredential(credential);
  if (verificationResponse.error) {
    return {
      error: true,
      message:
        `There was an error verifying while verifying credential: ${
          verificationResponse.message}`,
      data: {},
    };
  }
  const verification = verificationResponse.data;
  for (const proof of credential.proof || []) {
    const vm = proof.verificationMethod;
    const did = vm.substring(0, vm.indexOf('#'));
    const issuerDetailsToSet = await resolveIssuer(did, proof.domain);
    proofs.push({
      position:
        did.toLocaleLowerCase() === credential.issuer.toLowerCase()
          ? 'Issuer'
          : 'Signer',
      type: keyType[proof.type],
      did,
      ...issuerDetailsToSet,
      valid:
        did === credential.issuer
          ? verification.issuerSignatureValid
          : await verifySignature(credential, proof.proofValue), // TODO: improve
      domain: proof.domain ? proof.domain : null,
      verificationMethod: proof.verificationMethod
        ? proof.verificationMethod
        : null,
    });
  }
  return {
    error: false,
    message: undefined,
    data: { proofs, verification },
  };
}

function Item({ match }) {
  const { user } = useAuthContext();

  const [activeIndex, setActiveIndex] = useState(0);
  const [verifying, setIsVerifying] = useState(true);
  const [balance, setBalance] = useState(0);
  const [rootOfTrust, setRootOfTrust] = useState([]);
  const item = user.credentials.find((c) => c.id === match.params.id);
  const credential = item.type === 'VerifiablePresentation'
    ? item.verifiableCredential[0]
    : item;
  const attachment = item.type === 'VerifiablePresentation' ? item.attachment : null;
  const context = credential['@context'];
  const type = (!Array.isArray(context)
    ? types[context]
    : types[context[context.length - 1]])
    || types['https://www.w3.org/2018/credentials/v1'];
  const [proofs, setProofs] = useState([]);

  const resolveRootOfTrust = async (
    proofs,
    issuer,
    trustedList = undefined,
  ) => {
    if (!trustedList) {
      const rootOfTrustrByDomain = await resolveRootOfTrustByDomain(
        proofs,
        issuer,
      );
      if (
        !rootOfTrustrByDomain.error
        && rootOfTrustrByDomain.data.trustTree.length > 0
      ) {
        setRootOfTrust(rootOfTrustrByDomain.data.trustTree);
        return {
          error: false,
          message: null,
          data: {
            trustTree: rootOfTrustrByDomain.data.trustTree,
          },
        };
      }
    }
    try {
      const rootOfTrust = await getRootOfTrust(trustedList, issuer);
      const validation = await verifyRootOfTrust(rootOfTrust, issuer);
      const trustTree = rootOfTrust.map((rot, i) => ({
        ...rot,
        valid: validation[i],
      }));
      if (rootOfTrust.length > 0) {
        proofs = proofs.map((proof) => ({
          ...proof,
          name:
            proof.did === issuer
              ? rootOfTrust.find((r) => issuer.endsWith(r.address))?.name
              : proof.name,
        }));
        setProofs(proofs);
      }
      setRootOfTrust(trustTree);
      return {
        error: false,
        message: null,
        data: {
          trustTree,
        },
      };
    } catch (e) {
      const message = 'Unable to verify root of trust';
      return {
        error: true,
        message,
        data: {},
      };
    }
  };

  useEffect(() => {
    setActiveIndex(getInitialNavLinkToSet());
    if (type.kind === 'vc') {
      verifyCredentialAndResolveIssuer(credential).then(async (result) => {
        if (result.error) {
          console.log('ERROR::', result.message);
          setIsVerifying(false);
          return;
        }
        const { data } = result;
        setProofs(data.proofs);
        const trustTreeResponse = await resolveRootOfTrust(
          data.proofs,
          credential.issuer,
          credential.trustedList,
        );
        if (trustTreeResponse.error) {
          console.log('ERROR::', trustTreeResponse.message);
        }
        setIsVerifying(false);
      });
    } else {
      switch (type.title) {
        case 'ERC-20 Token':
          getERC20Balance(credential.address, user.did.replace(/.*:/, '')).then(
            (balance) => {
              const amount = balance.toNumber() / 10 ** credential.decimals;
              setBalance(amount);
            },
          );
          break;
        case 'NFT Token':
          getNFTBalance(
            credential.address,
            user.did.replace(/.*:/, ''),
            credential.tokenId,
          ).then((balance) => setBalance(balance));
          break;
        case 'Tokenized Money':
          getTokenizedBalance(credential.address).then((balance) => setBalance(balance));
          break;
        default:
          console.log(`Unsupported token: ${type.title}`);
      }
    }
  }, []);

  /**
   * if the preview is of DDCCCoreDataSet type then it returns a PDF elemenet otherwise returns undefined
   * @returns
   */
  function getDDCCCoreDataSetPreview() {
    let downloadablePdf;
    let viewablePdf;
    try {
      if (validateVaccinationCertificateV2VerifiableCredential(credential)) {
        const downloadablePdf1 = GetPdfFromCredential(credential);
        downloadablePdf = downloadablePdf1;
        viewablePdf = (
          <Document
            file={downloadablePdf[0].url}
            onloadSuccess={onDocumentLoadSuccess}
          >
            <Page pageNumber={1} scale={0.55} />
          </Document>
        );
        if (viewablePdf && downloadablePdf) {
          return (
            <a href={downloadablePdf[0].url} target="_blank" rel="noreferrer">
              {viewablePdf}
            </a>
          );
        }
      }
    } catch (e) {
      console.log(
        'ERROR:: There was an error converting to image... skipping',
        e,
      );
    }
  }

  function onDocumentLoadSuccess({ numPages }) {
    console.log(`INFO:: Successfully loaded document ${numPages}`);
  }

  function getDefaultPreview() {
    return (
      <div className={styles.preview}>
        <img srcSet={`${type.image2x} 2x`} src={type.image} alt="Card" />
        <div className={styles.control}>
          <div className={styles.topLeft}>{type.topLeft(credential)}</div>
          <div className={styles.topRight}>
            {type.topRight({ ...credential, balance })}
          </div>
          <div className={styles.title}>{type.claim(credential)}</div>
          {type.icon(credential) && (
            <div className={styles.image}>{type.icon(credential)}</div>
          )}
          <div className={styles.claim}>{type.title}</div>
          <div className={styles.bottom}>{type.bottom(credential)}</div>
        </div>
      </div>
    );
  }

  function getPreview() {
    const dDCCCoreDataSetPreview = getDDCCCoreDataSetPreview();
    if (dDCCCoreDataSetPreview) return dDCCCoreDataSetPreview;
    return getDefaultPreview();
  }
  /// /////////////////////////////////
  /// navigation bar customization ///
  /**
   * Checks whether the passed link is 'EU' and whether the current type is 1 or 2, then returns true.
   * @param {string} link
   * @param {any} type. See {@link types}
   * @returns boolean indicating whether the passed option must be enabled or not.
   */
  const isEUTabDisplayable = (link, type) => link !== 'EU' || type.id === 1 || type.id === 2;

  /**
   * Claims tab is not displayable when type.id = 12 meaning when the verifiable credential is of type
   * https://credentials-library.lacchain.net/credentials/health/vaccination/v3
   * @param {string} link
   * @param {any} type. See {@link types}
   * @returns boolean indicating whether the passed option must be enabled or not.
   */
  const isClaimsTabDisplayable = (link, type) => link !== 'Claims' || type.id !== 12;

  const getInitialNavLinkToSet = () => {
    let idxToSet = 1000;
    navLinks
      .filter(
        (link) => isEUTabDisplayable(link.name, type)
          && isClaimsTabDisplayable(link.name, type),
      )
      .map((el) => {
        if (el.index < idxToSet) idxToSet = el.index;
      });
    return idxToSet;
  };

  const filteredNavigationLinkButtons = navLinks
    .filter(
      (link) => isEUTabDisplayable(link.name, type)
        && isClaimsTabDisplayable(link.name, type),
    )
    .map((x) => (
      <button
        className={cn(
          { [styles.active]: x.index === activeIndex },
          styles.link,
        )}
        onClick={() => setActiveIndex(x.index)}
        key={x.index}
      >
        {x.name}
      </button>
    ));
  /// /////////////////////////////////

  return (
    <div>
      <div className={cn('container', styles.container)}>
        <div className={styles.card_wrapper}>
          <div className={styles.card}>
            <div className={styles.preview}>{getPreview()}</div>
          </div>
          {type.kind === 'token'
            && type.title === 'NFT Token'
            && balance === 0 ? (
              <></>
            ) : (
              <Options
                className={styles.options}
                item={credential}
                type={type}
                attachment={attachment}
              />
            )}
        </div>
        <div className={styles.details}>
          <h1 className={cn('h5', styles.title2)}>
            {type.kind === 'vc' ? type.title : type.claim(credential)}
          </h1>
          <div className={styles.cost}>
            <div className={styles.categories}>
              {type.kind === 'token' && (
              <div
                className={cn({ 'category-token': true }, styles.category)}
              >
                Token
              </div>
              )}
              {credential.type.map((ct) => (
                <div
                  key={ct}
                  className={cn(
                    { 'category-vc': ct === 'VerifiableCredential' },
                    { 'category-vc-id': ct === 'IdentityCard' },
                    { 'category-vc-trusted': ct === 'TrustedCredential' },
                    { 'category-vc-health': ct === 'VaccinationCertificate' },
                    { 'category-vc-academy': ct === 'EducationCertificate' },
                    { 'category-erc20': ct === 'ERC-20' || ct === 'ERC20' },
                    { 'category-erc721': ct === 'ERC-721' },
                    { 'category-tokenized': ct === 'TokenizedMoney' },
                    { 'category-generic': ct !== '' },
                    styles.category,
                  )}
                >
                  {ct}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.info}>{type.description}</div>
          {type.kind === 'vc' ? (
            <>
              <div className={styles.nav}>
                {filteredNavigationLinkButtons}
              </div>
              {activeIndex === 0
                  && isClaimsTabDisplayable('Claims', type) && (
                    <Claims
                      className={styles.users}
                      claims={credential.credentialSubject}
                    />
              )}
              {activeIndex === 1 && (
              <Proofs className={styles.users} items={proofs} />
              )}
              {activeIndex === 2 && (
              <RootOfTrust
                className={styles.users}
                items={rootOfTrust}
                loading={verifying}
              />
              )}
              {activeIndex === 3 && (
              <Raw className={styles.users} credential={credential} />
              )}
              {activeIndex === 4 && (
              <Raw
                className={styles.users}
                credential={toEUCertificate(credential)}
              />
              )}
            </>
          ) : (
            <>
              <div className={styles.amount}>
                <span className={styles.text}>
                  {balance}
                  {' '}
                  {credential.symbol}
                </span>
              </div>
              <div className={styles.token}>
                <span className={styles.label}>Name: </span>
                <span className={styles.text}>{credential.name}</span>
              </div>
              <div className={styles.token}>
                <span className={styles.label}>Symbol: </span>
                <span className={styles.text}>{credential.symbol}</span>
              </div>
              <div className={styles.token}>
                <span className={styles.label}>Address: </span>
                <span className={styles.text}>{credential.address}</span>
              </div>
              {type.title === 'ERC-20 Token' && (
              <div className={styles.token}>
                <span className={styles.label}>Decimals: </span>
                <span className={styles.text}>{credential.decimals}</span>
              </div>
              )}
              {type.title === 'ERC-20 Token' && (
              <div className={styles.token}>
                <span className={styles.label}>Total Supply: </span>
                <span className={styles.text}>
                  {credential.totalSupply
                    ? credential.totalSupply / 10 ** credential.decimals
                    : 0}
                </span>
              </div>
              )}
              {type.title === 'NFT Token' && (
              <>
                <div className={styles.token}>
                  <span className={styles.label}>Token ID: </span>
                  <span className={styles.text}>{credential.tokenId}</span>
                </div>
                <div className={styles.token}>
                  <span className={styles.label}>Token URI: </span>
                  <span className={styles.text}>{credential.uri}</span>
                </div>
                <div className={styles.token}>
                  <span className={styles.label}>Owner: </span>
                  <span className={styles.text}>{credential.owner}</span>
                </div>
              </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Item;

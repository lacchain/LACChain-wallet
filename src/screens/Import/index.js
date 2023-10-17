import React, { useCallback, useState } from 'react';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import styles from './Import.module.sass';
import Control from '../../components/Control';
import Icon from '../../components/Icon';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import { AlertSuccess } from '../../components/Alert';
import { useAuthContext } from '../../contexts/authContext';
import Unlock from '../../components/Unlock';

const breadcrumbs = [
  {
    title: 'Register',
    url: '/register',
  },
  {
    title: 'Import',
  },
];

const sleep = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1e3));

function Import() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [preview, setPreview] = useState(null);
  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleUnlockModal, setVisibleUnlockModal] = useState(false);

  const {
    provider, account, decrypt, login,
  } = useAuthContext();

  const onDrop = useCallback((acceptedFiles) => {
    const selected = acceptedFiles[0];
    const reader = new FileReader();
    reader.readAsText(selected, 'UTF-8');
    reader.onload = async function (evt) {
      try {
        if (!provider) {
          setFile(evt.target.result);
          setVisibleUnlockModal(true);
          return;
        }
        const decrypted = await decrypt(evt.target.result);
        setPreview(JSON.stringify(decrypted, null, 2));
        setFile(evt.target.result);
        setError(null);
      } catch (error) {
        setError(error.message);
      }
    };
  }, []);

  const onUnlock = (result) => {
    setError(null);
    setVisibleUnlockModal(false);
    setPreview(JSON.stringify(result, null, 2));
  };

  const restore = async (data) => {
    setRestoring(true);
    localStorage.setItem(account, data);
    await sleep(1);
    await login();
    setRestoring(false);
    setVisibleModal(true);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ maxFiles: 1, onDrop });

  return (
    <div className={styles.page}>
      <Control className={styles.control} item={breadcrumbs} />
      <div className={cn('section-pb', styles.section)}>
        <div className={cn('container', styles.container)}>
          <div className={styles.top}>
            <h3 className={cn('h4', styles.title)}>Import Wallet</h3>
            <div className={styles.info}>
              You need to upload the encrypted backup of your wallet.
              {' '}
              {' '}
              {' '}
              If you don't have any wallet,
              please
              {' '}
              <Link to="/register"><strong>register</strong></Link>
              {' '}
              first.
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.list}>
                <div className={styles.item}>
                  <form className={styles.form} action="">
                    <div className={styles.list}>
                      <div className={styles.item}>
                        <div
                          className={cn(styles.file, {
												  [styles.dragging]: isDragActive,
                          })}
                          {...getRootProps()}
                        >
                          <input className={styles.load} type="file" {...getInputProps()} />
                          {error
														&& <span className="status-pink">{error}</span>}
                          {file <= 0
                            ? (
                              <>
                                <div className={styles.icon}>
                                  <Icon name="upload-file" size="24" />
                                </div>
                                <div className={styles.format}>
                                  ZIP, GZIP, RAR, TAR. Max 1Gb.
                                </div>
                              </>
                            )
                            : <pre className={styles.preview}>{preview}</pre>}
                        </div>
                      </div>
                    </div>
                  </form>
                  <Modal
                    visible={visibleModal}
                    closable={false}
                    onClose={() => setVisibleModal(false)}
                  >
                    <AlertSuccess
                      onAccept={() => {
										  setVisibleModal(false);
										  window.location = '/';
                      }}
                      title="Wallet Successfully Imported"
                    >
                      You successfully imported the
                      {' '}
                      <span>encrypted</span>
                      {' '}
                      wallet data
                    </AlertSuccess>
                  </Modal>
                  <Modal
                    visible={visibleUnlockModal}
                    closable
                    onClose={() => setVisibleUnlockModal(false)}
                  >
                    <Unlock data={file} onFinish={onUnlock} />
                  </Modal>
                </div>
              </div>
              <div className={styles.btns}>
                <button
                  disabled={!file}
                  className={cn('button', {
									  disabled: !file,
                  }, styles.button)}
                  onClick={() => restore(file)}
                  type="button"
                >
                  {!restoring
                    ? <span>Import</span>
                    :										<Loader className={styles.loader} color="white" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Import;

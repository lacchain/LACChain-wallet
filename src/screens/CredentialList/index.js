import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import styles from './CredentialList.module.sass';
import CredentialCard from '../../components/CredentialCard';
import { useAuthContext } from '../../contexts/authContext';
import Modal from '../../components/Modal';
import RemoveSale from '../../components/RemoveSale';

const navLinks = [{
  label: 'All',
  context: '*',
}, {
  label: 'Credentials',
  context: 'https://',
}, {
  label: 'Tokens',
  context: 'token://',
}, {
  label: 'Other',
  context: 'other://',
}];

function CredentialList() {
  const { user, update, updated } = useAuthContext();

  const localCredentials = user.credentials || '[]';

  const [results, setResults] = useState(localCredentials);
  const [filtered, setFiltered] = useState(results);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(-1);
  const [visibleModalRemove, setVisibleModalRemove] = useState(false);

  useEffect(() => {
    setResults(user.credentials);
    setFiltered(user.credentials);
  }, [updated]);

  const handleRemove = async () => {
    const credentials = user.credentials.filter((c) => c.id !== selectedItem);
    await update({ ...user, credentials });
    setVisibleModalRemove(false);
  };

  return (
    <div className={cn('', styles.section)}>
      <div className={cn('container', styles.container)}>
        <div className={styles.top}>
          <div className={styles.nav}>
            {navLinks.map((x, index) => (
              <button
                className={cn(styles.link, {
                  [styles.active]: index === activeIndex,
                })}
                onClick={() => {
                                	setActiveIndex(index);
                  setFiltered(results.filter((c) => {
                    const context = Array.isArray(c['@context']) ? c['@context']?.slice(-1)[0] : c['@context'];
                    return context?.startsWith(x.context) || x.context === '*';
                  }));
                }}
                key={index}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.wrapper}>
            <div className={styles.list}>
              {filtered.filter((x) => x.id).map((x, index) => (
                <CredentialCard
                  className={styles.card}
                  item={x}
                  key={index}
                  onRemove={() => {
								  setVisibleModalRemove(true);
								  setSelectedItem(x.id);
                  }}
                />
              ))}
            </div>
            <Modal
              visible={visibleModalRemove}
              onClose={() => setVisibleModalRemove(false)}
            >
              <RemoveSale onAccept={() => handleRemove()} />
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CredentialList;

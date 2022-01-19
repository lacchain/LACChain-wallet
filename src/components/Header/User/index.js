import React, { useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./User.module.sass";
import Icon from "../../Icon";
import Theme from "../../Theme";
import { useAuthContext } from "../../../contexts/authContext";
import Modal from "../../Modal";
import LoaderCircle from "../../LoaderCircle";
import { syncCredentials } from "../../../utils/credentials";
import AddToken from "../../AddToken";
import { formatDID, formatUser } from "../../../utils/format";

const User = ({ className }) => {
  const [visibleAddToken, setVisibleAddToken] = useState(false);
  const [visible, setVisible] = useState(false);
  const [syncing, setSyncing] = useState( false );
  const { account, user, update } = useAuthContext();
  const displayAccount = account ? `${account.substring( 0, 7 )} ... ${account.substring( 37 )}` : '';

  const items = [
    {
      title: "Profile",
      icon: "user",
      url: "/profile",
    },
    {
      title: "Sync",
      icon: "lightning",
      action: async () => {
        setSyncing( true );
        syncCredentials( user, update ).then( () => {
          setSyncing( false );
        } ).catch( () => {
          setSyncing( false );
        } );
      },
    },
    {
      title: "Add Token",
      icon: "plus-circle",
      action: () => setVisibleAddToken( true ),
    },
    {
      title: "Dark theme",
      icon: "bulb",
    }
  ];


  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div className={cn(styles.user, className)}>
        <div className={styles.head} onClick={() => setVisible(!visible)}>
          <div className={styles.avatar}>
            <img src="/images/content/avatar-user.jpg" alt="Avatar" />
          </div>
          &nbsp; {` ${displayAccount}`}
        </div>
        {visible && (
          <div className={styles.body}>
            <div className={styles.name}>{formatUser( user )}</div>
            <div className={styles.code}>
              <div className={styles.number}>{formatDID( user )}</div>
              <button className={styles.copy} onClick={() => navigator.clipboard.writeText(user.did)}>
                <Icon name="copy" size="16" />
              </button>
            </div>
            <div className={styles.menu}>
              {items.map((x, index) =>
                x.url ? (
                  x.url.startsWith("http") ? (
                    <a
                      className={styles.item}
                      href={x.url}
                      rel="noopener noreferrer"
                      key={index}
                    >
                      <div className={styles.icon}>
                        <Icon name={x.icon} size="20" />
                      </div>
                      <div className={styles.text}>{x.title}</div>
                    </a>
                  ) : (
                    <Link
                      className={styles.item}
                      to={x.url}
                      onClick={() => setVisible(!visible)}
                      key={index}
                    >
                      <div className={styles.icon}>
                        <Icon name={x.icon} size="20" />
                      </div>
                      <div className={styles.text}>{x.title}</div>
                    </Link>
                  )
                ) : x.action ? (
                    <a
                        className={styles.item}
                        href="#"
                        onClick={async () => { await x.action(); setVisible(!visible); }}
                        rel="noopener noreferrer"
                        key={index}
                    >
                      <div className={styles.icon}>
                        <Icon name={x.icon} size="20" />
                      </div>
                      <div className={styles.text}>{x.title}</div>
                    </a>
                ) : (
                  <div className={styles.item} key={index}>
                    <div className={styles.icon}>
                      <Icon name={x.icon} size="20" />
                    </div>
                    <div className={styles.text}>{x.title}</div>
                    <Theme className={styles.theme} />
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
      {syncing &&
          <Modal
              visible={true}
              closable={false}
          >
            <div className={styles.line}>
              <div className={styles.icon_loader}>
                <LoaderCircle className={styles.loader}/>
              </div>
              <div className={styles.details}>
                <div className={styles.subtitle}>Fetching credentials</div>
                <div className={styles.text}>
                  Synchronizing local storage with mailbox
                </div>
              </div>
            </div>
          </Modal>
      }
      <Modal
          visible={visibleAddToken}
          onClose={() => setVisibleAddToken( false )}
      >
        <AddToken onAdded={() => setVisibleAddToken( false )}/>
      </Modal>
    </OutsideClickHandler>
  );
};

export default User;

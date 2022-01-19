import React, { useState } from "react";
import cn from "classnames";
import styles from "./Login.module.sass";
import Control from "../../components/Control";
import TextInput from "../../components/TextInput";
import Icon from "../../components/Icon";
import { decrypt } from "../../utils/crypt";
import Loader from "../../components/Loader";
import TextArea from "../../components/TextArea";

const breadcrumbs = [
  {
    title: "Register",
    url: "/register",
  },
  {
    title: "Login",
  },
];

const Login = () => {
  const [did, setDID] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async() => {
    setSending( true );
    const encrypted = localStorage.getItem( did );
    const user = decrypt( encrypted, password );
    if( !user || !user.id ) {
      setError('Invalid user data or password');
      return;
    }
    localStorage.setItem( "key", password );
    localStorage.setItem( "current", did );
    localStorage.setItem( user.id, encrypted );
    setSending( false );
  }

  return (
    <div className={styles.page}>
      <Control className={styles.control} item={breadcrumbs} />
      <div className={cn("section-pb", styles.section)}>
        <div className={cn("container", styles.container)}>
          <div className={styles.top}>
            <h3 className={cn("h4", styles.title)}>Login</h3>
            <div className={styles.info}>
              You need to provide your did and password to unlock the account. {" "} If you don't have any account {" "}
              <strong>register</strong> first.
            </div>
            {error &&
            <div className={styles.error}>
              {error}
            </div> }
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.list}>
                <div className={styles.item}>
                  <div className={styles.category}>Account data</div>
                  <div className={styles.fieldset}>
                    <TextArea
                        className={styles.field}
                        value={did}
                        onChange={e => setDID( e.target.value )}
                        label="Account DID"
                        name="Encrypted DID Data"
                        type="text"
                        rows={20}
                        placeholder="Enter your encrypted DID Data"
                        required
                    />
                  </div>
                  <div className={styles.fieldset2}>
                    <TextInput
                        className={styles.field}
                        value={password}
                        onChange={e => setPassword( e.target.value )}
                        label="password"
                        name="Password"
                        type="password"
                        placeholder="Enter your password"
                        required
                    />
                  </div>
                </div>
              </div>
              <div className={styles.btns}>
                <button className={cn("button", styles.button)} onClick={handleSubmit}>
                  {!sending ?
                      "Login" :
                      <Loader className={styles.loader} color="white"/>
                  }
                </button>
                <button className={styles.clear}>
                  <Icon name="circle-close" size="24" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

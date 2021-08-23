import React, { useState } from "react";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Actions.module.sass";
import Transfer from "../Transfer";
import RemoveSale from "../RemoveSale";
import Burn from "../Burn";
import Report from "../Report";
import Icon from "../Icon";
import Modal from "../../components/Modal";
import { toCborQR } from "../../utils/verification";

const Actions = ({ className, credential }) => {
  const [visible, setVisible] = useState(false);
  const [visibleModalTransfer, setVisibleModalTransfer] = useState(false);
  const [visibleModalRemoveSale, setVisibleModalRemoveSale] = useState(false);
  const [visibleModalBurn, setVisibleModalBurn] = useState(false);
  const [visibleModalReport, setVisibleModalReport] = useState(false);
  const [qrCode, setQRCode] = useState("");

  const items = [
    {
      title: "Create Presentation",
      icon: "edit",
      action: () => setVisibleModalBurn(true),
    },
    {
      title: "Show QR Code",
      icon: "share",
      action: () => {
          toCborQR( credential ).then( qr => {
              setQRCode( qr );
              setVisibleModalReport( true );
          });
      },
    },
  ];

  return (
    <>
      <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
        <div
          className={cn(styles.actions, className, {
            [styles.active]: visible,
          })}
        >
          <button
            className={cn("button-circle-stroke", styles.button)}
            onClick={() => setVisible(!visible)}
          >
            <Icon name="share" size="24" />
          </button>
          <div className={styles.body}>
            {items.map((x, index) => (
              <div className={styles.item} key={index} onClick={x.action}>
                <Icon name={x.icon} size="20" />
                <span>{x.title}</span>
              </div>
            ))}
          </div>
        </div>
      </OutsideClickHandler>
      <Modal
        visible={visibleModalTransfer}
        onClose={() => setVisibleModalTransfer(false)}
      >
        <Transfer />
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
        <Burn credential={credential} />
      </Modal>
      <Modal
        visible={visibleModalReport}
        onClose={() => setVisibleModalReport(false)}
      >
        <Report qr={qrCode}/>
      </Modal>
    </>
  );
};

export default Actions;

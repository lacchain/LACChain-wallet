import React, { useCallback, useState } from "react";
import cn from "classnames";
import { useDropzone } from 'react-dropzone';
import styles from "./BackupAndRestore.module.sass";
import Icon from "../../../components/Icon";
import Loader from "../../../components/Loader";
import Modal from "../../../components/Modal";
import { AlertSuccess } from "../../../components/Alert";
import { useAuthContext } from "../../../contexts/authContext";

const sleep = seconds => new Promise( resolve => setTimeout( resolve, seconds * 1e3 ) );

const BackupAndRestore = () => {
	const [file, setFile] = useState( null );
	const [error, setError] = useState( null );
	const [restoring, setRestoring] = useState( false );
	const [preview, setPreview] = useState( null );
	const [visibleModal, setVisibleModal] = useState( false );

	const { account, decrypt, login } = useAuthContext();

	const onDrop = useCallback( acceptedFiles => {
		const selected = acceptedFiles[0];
		const reader = new FileReader();
		reader.readAsText( selected, "UTF-8" );
		reader.onload = async function( evt ) {
			try {
				const decrypted = await decrypt( evt.target.result );
				setPreview( JSON.stringify( decrypted, null, 2) );
				setFile( evt.target.result );
				setError( null );
			} catch( error ) {
				setError( error.message );
			}
		}
	}, [] );


	const restore = async data => {
		setRestoring( true );
		localStorage.setItem( account, data );
		await sleep(1);
		await login();
		setRestoring( false );
		setVisibleModal( true );
	}

	const backup = () => {
		const data = localStorage.getItem( account );
		const url = window.URL.createObjectURL( new Blob( [data] ) );
		const link = document.createElement( 'a' );
		link.href = url;
		link.setAttribute( 'download', 'wallet.json' );
		document.body.appendChild( link );
		link.click();
	}

	const { getRootProps, getInputProps, isDragActive } = useDropzone( { maxFiles: 1, onDrop } )

	return (
		<>
			<form className={styles.form} action="">
				<div className={styles.list}>
					<div className={styles.item}>
						<div className={styles.category}>Restore Wallet</div>
						<div className={styles.note}>
							Drag or choose your file to upload
						</div>
						<div className={cn( styles.file, {
							[styles.dragging]: isDragActive
						} )} {...getRootProps()}>
							<input className={styles.load} type="file" {...getInputProps()} />
							{error &&
								<span className="status-pink">{error}</span>
							}
							{file <= 0 ?
								<>
									<div className={styles.icon}>
										<Icon name="upload-file" size="24"/>
									</div>
									<div className={styles.format}>
										ZIP, GZIP, RAR, TAR. Max 1Gb.
									</div>
								</> :
								<pre className={styles.preview}>{preview}</pre>
							}
						</div>
						<button
							disabled={!file}
							className={cn( "button", {
								'disabled': !file
							}, styles.button )}
							onClick={() => restore( file )}
							type="button"
						>
							{!restoring ?
								<span>Restore Wallet</span>
								:
								<Loader className={styles.loader} color="white"/>
							}
						</button>
					</div>
					<div className={styles.item}>
						<div className={styles.category}>Backup Wallet</div>
						<div className={styles.note}>
							Drag or choose your file to upload
						</div>

						<button
							className={cn( "button-orange", styles.button )}
							onClick={() => backup()}
							type="button"
						>
							<span>Download backup</span>
						</button>
					</div>
				</div>
			</form>
			<Modal visible={visibleModal} closable={false} onClose={() => setVisibleModal( false )}>
				<AlertSuccess onAccept={() => {
					setVisibleModal( false );
					window.location = '/';
				}} title="Wallet Successfully Recovered">
					You successfully imported the <span>encrypted</span> wallet data
				</AlertSuccess>
			</Modal>
		</>
	);
};

export default BackupAndRestore;

import React from "react";
import { usePDF } from "@react-pdf/renderer";
import { Document, Font, Image, Page, Text, View } from "@react-pdf/renderer";

export const GetPdfFromCredential = (credential) => {
  return usePDF({
    document: <VcToPdf item={credential} />,
  });
};
export const validateVaccinationCertificateV2VerifiableCredential = (vc) => {
  const isQrImage =
    vc &&
    vc.credentialSubject &&
    vc.credentialSubject.image &&
    vc.credentialSubject.image.contentUrl;
  if (isQrImage) {
    return true;
  }
  return false;
};

const VcToPdf = ({ item }) => {
  console.log("item", item);
  const styles = {
    body: {
      paddingTop: 35,
      paddingBottom: 65,
      paddingHorizontal: 35,
      flexDirection: "column",
      fontFamily: "Lato",
      fontWeight: "normal",
      fontStyle: "normal",
      display: "flex",
    },
    title: {
      fontSize: 24,
      textAlign: "center",
    },
    author: {
      fontSize: 12,
      textAlign: "center",
      marginBottom: 40,
    },
    subtitle: {
      marginTop: "auto",
      fontSize: 12,
      color: "#3a86ff",
    },
    text: {
      margin: 1,
      fontSize: 12,
      textAlign: "justify",
    },
    label: {
      margin: 1,
      fontSize: 10,
      textAlign: "justify",
      // fontFamily: "Times-Roman",
      fontFamily: "Lato",
      fontWeight: 300,
      fontStyle: "normal",
    },
    image: {
      marginVertical: 15,
      marginHorizontal: 100,
    },
    header: {
      fontSize: 12,
      marginBottom: 20,
      textAlign: "center",
      color: "grey",
    },
    pageNumber: {
      position: "absolute",
      fontSize: 12,
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: "center",
      color: "grey",
    },
    certificateHeader: {
      borderRadius: "5px",
      flexDirection: "row",
      display: "flex",
      backgroundColor: "#e5e5e5",
      height: "8%",
      width: "100%",
      justifyContent: "space-between",
    },
    headerLeft: {
      padding: "1%",
      flexDirection: "column",
      display: "flex",
      height: "100%",
      width: "50%",
      alignItems: "stretch",
    },
    headerRight: {
      margin: "auto",
      display: "flex",
      height: "50%",
      width: "50%",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center",
    },
    identificationData: {
      borderRadius: "5px",
      padding: "1%",
      margin: "auto",
      borderWidth: 2,
      borderColor: "#e5e5e5",
      borderStyle: "solid",
      // backgroundColor: "#e29e37",
      height: "90%",
      width: "60%",
      position: "relative",
    },
    identificationDataElement: {
      height: "33%",
      width: "100%",
    },
    qrCode: {
      padding: "1%",
      height: "100%",
      width: "40%",
      alignItems: "center",
    },
    qrImage: {
      width: "95%",
    },
    identQr: {
      flexDirection: "row",
      display: "flex",
      height: "25%",
      width: "100%",
      alignItems: "stretch",
    },
    vaccinationDetailContainer: {
      height: "20%",
      width: "100%",
    },
    vaccinationDetailDataElement: {
      margin: "auto",
      height: "40%",
      width: "100%",
    },
    vaccineDetailsContainer: {
      height: "35%",
      width: "100%",
    },
    vaccineDetailsWrapper: {
      marginTop: "1%",
      display: "flex",
      flexWrap: "wrap",
      flexDirection: "row",
      borderWidth: 2,
      borderColor: "#e5e5e5",
      borderStyle: "solid",
      width: "100%",
      // alignItems: "stretch", // cross axis alignment
      justifyContent: "space-between", // main axis alignment
      borderRadius: "5px",
    },
    // commons
    elementWrapperHalfRow: {
      padding: "1%",
      width: "50%",
      position: "relative",
    },
    // commons
    wrapper: {
      padding: "1%",
      width: "100%",
      position: "relative",
    },
    lineBreak: {
      width: "100%",
    },
  };

  const Quixote = () => (
    <Document pageLayout="singlePage" pageMode="fullScreen">
      <Page style={styles.body}>
        <View style={styles.certificateHeader}>
          <View style={styles.headerLeft}>
            <Text
              style={{
                ...styles.subtitle,
                fontFamily: "Lato",
                fontWeight: "normal",
                fontStyle: "bold",
              }}
            >
              DIGITAL VACCINATION CERTIFICATE
            </Text>
            <Text
              style={{
                ...styles.subtitle,
                fontFamily: "Lato",
                fontWeight: "normal",
                fontStyle: "bold",
              }}
            >
              CERTIFICADO DIGITAL DE VACUNACIÓN
            </Text>
            <Text style={styles.subtitle}>Vaccination · Vacunación</Text>
          </View>
          <View style={styles.headerRight}>
            <Text
              style={{
                ...styles.subtitle,
                margin: "0", // overrides subtitle marginTop
                fontFamily: "Lato",
                fontWeight: "normal",
                fontStyle: "bold",
              }}
            >
              ACTIVE
            </Text>
          </View>
        </View>
        <View style={styles.identQr}>
          <View style={styles.identificationData}>
            <View style={styles.identificationDataElement}>
              <Text style={styles.label}>Name/Nombre:</Text>
              <Text style={styles.text}>
                {item.credentialSubject.recipient.name}
              </Text>
            </View>

            <View style={styles.identificationDataElement}>
              <Text style={styles.label}>
                Date of birth / Fecha de nacimiento
              </Text>
              <Text style={styles.text}>
                {item.credentialSubject.recipient.birthDate}
              </Text>
            </View>

            <View style={styles.identificationDataElement}>
              <Text style={styles.label}>Gender / Género:</Text>
              <Text style={styles.text}>
                {item.credentialSubject.recipient.gender}
              </Text>
            </View>

            <View style={styles.identificationDataElement}>
              <Text style={styles.label}>
                Document Number/Número de documento:
              </Text>
              <Text style={styles.text}>
                {item.credentialSubject.recipient.identifier}
              </Text>
            </View>
          </View>

          <View style={styles.qrCode}>
            <Image
              style={styles.qrImage}
              src={`data:image/png;base64,${item.credentialSubject.image.contentUrl}`}
            />
          </View>
        </View>
        <View style={styles.vaccinationDetailContainer}>
          <View style={styles.wrapper}>
            <Text style={styles.subtitle}>
              Vaccination details / Datos de la vacunación
            </Text>
          </View>

          <View
            style={{
              ...styles.wrapper,
              backgroundColor: "#e5e5e5",
              borderRadius: "5px",
              height: "70%",
            }}
          >
            <View style={styles.vaccinationDetailDataElement}>
              <Text style={styles.label}>
                Certificate identifier / Identificador del certificado
              </Text>
              <Text style={styles.text}>{item.identifier}</Text>
            </View>

            <View style={styles.vaccinationDetailDataElement}>
              <Text style={styles.label}>
                Certificate issuer / Emisor del certificado
              </Text>
              <Text style={styles.text}>{item.name}</Text>
            </View>
          </View>
        </View>
        <View style={styles.vaccineDetailsContainer}>
          <View style={styles.wrapper}>
            <Text style={styles.subtitle}>
              Vaccine details / Datos de la vacuna
            </Text>
          </View>

          <View style={styles.vaccineDetailsWrapper}>
            <View style={styles.elementWrapperHalfRow}>
              <Text style={styles.label}>
                Product Name / Nombre del Producto
              </Text>
              <Text style={styles.text}>
                {item.credentialSubject.vaccine.medicinalProductName}
              </Text>
            </View>
            <View style={styles.elementWrapperHalfRow}>
              <Text style={styles.label}>
                Number of doses / número de dosis
              </Text>
              <Text style={styles.text}>{item.credentialSubject.order}</Text>
            </View>
            <View style={styles.elementWrapperHalfRow}>
              <Text style={styles.label}>ATC Code</Text>
              <Text style={styles.text}>
                {item.credentialSubject.vaccine.atcCode}
              </Text>
            </View>
            <View style={styles.elementWrapperHalfRow}>
              <Text style={styles.label}>
                Date of vaccination / Fecha de vacunación
              </Text>
              <Text style={styles.text}>
                {item.credentialSubject.dateOfVaccination}
              </Text>
            </View>
            <View style={styles.elementWrapperHalfRow}>
              <Text style={styles.label}>
                Vaccination Centre / Centro de Vacunación
              </Text>
              <Text style={styles.text}>
                {item.credentialSubject.administeringCentre}
              </Text>
            </View>
            <View style={styles.elementWrapperHalfRow}>
              <Text style={styles.label}>Batch Number / Número de Lote</Text>
              <Text style={styles.text}>
                {item.credentialSubject.batchNumber}
              </Text>
            </View>
          </View>
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );

  // https://gist.github.com/karimnaaji/b6c9c9e819204113e9cabf290d580551
  Font.register({
    family: "Lato",
    fonts: [
      {
        src: "http://fonts.gstatic.com/s/lato/v11/Upp-ka9rLQmHYCsFgwL-eg.ttf",
        fontWeight: 100, // 100
        fontStyle: "normal",
      },
      {
        src: "http://fonts.gstatic.com/s/lato/v11/Ja02qOppOVq9jeRjWekbHg.ttf",
        fontWeight: 300,
        fontStyle: "normal",
      },
      {
        src: `https://fonts.gstatic.com/s/lato/v16/S6uyw4BMUTPHjx4wWw.ttf`,
        fontWeight: "normal", // 400
        fontStyle: "normal",
      },
      {
        src: "https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh6UVSwiPHA.ttf",
        fontWeight: "normal", // 400
        fontStyle: "bold",
      },
    ],
  });
  return Quixote();
};

export default VcToPdf;

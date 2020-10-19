import React from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent } from '@material-ui/core';

const iframeStyle = {
  width: "100%",
  height: "640px",
};

// const walletOrigin = "https://yopta.net";
const walletOrigin = "http://localhost:8080/main-index.html";
// const walletOrigin = "https://walet.velas.com"; prod - not working yet
function Form() {
  const [to, setTo] = React.useState("");
  const [data, setData] = React.useState("");
  const [amount, setAmount] = React.useState("0");
  const [opened, setOpened] = React.useState(false);
  const openWallet = () => setOpened(true);
  const closeWallet = () => setOpened(false);
  const iframeSrc = `${walletOrigin}#to=${to}&transaction=${data}&amount=${amount}`;
  const onMessage = (event) => {
    if (event.origin !== walletOrigin) {
      return;
    }
    try {
      const json = JSON.parse(event.data);
      if (json.err) {
        throw new Error(json.err);
      }
      alert(json.txHash);
    } catch(e) {
      alert(e.message);
    }
    closeWallet();
  };
  React.useEffect(() => {
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  });
  return (
    <form noValidate autoComplete="off">
      <TextField id="standard-basic" label="To(vlx or eth format)" onChange={(event) => setTo(event.target.value)} value={to} />
      <TextField id="filled-basic" label="Data(hex)" onChange={(event) => setData(event.target.value)} value={data} />
      <TextField id="outlined-basic" label="Amount" onChange={(event) => setAmount(event.target.value)} value={amount}/>
      <Button variant="contained" onClick={openWallet}>Open</Button>
      <Dialog open={opened} onClose={closeWallet}>
          <DialogTitle id="customized-dialog-title" onClose={closeWallet}>
            Sign your transaction
          </DialogTitle>
          <DialogContent dividers>
              <iframe style={iframeStyle} src={iframeSrc}></iframe>
          </DialogContent>
      </Dialog>
    </form>
  );
}

function App() {
  const [address, setAddress] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [status, setStatus] = React.useState("loading");
  const iframeSrc = `${walletOrigin}`;
  let interval4Address = null;
  let iframe = null;
  const onMessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      switch(message.type) {
        case "address":
          clearInterval(interval4Address);
          if (message.address) {
            alert(message.address) || setAddress(message.address);
            iframe.contentWindow.postMessage(JSON.stringify({type: "send", transaction: "0x3ea15d620000000000000000000000000000000000000000000000000000000000000040000000000000000000000000eb057d96e2532257e47dbd8d3090c8be5030db7700000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000381", to: "0x1100000000000000000000000000000000000001"}), "*");
          }
          if (message.err)
            alert(message.err) || setError(new Error(message.err));
        break;
        case "tx":
          alert(message.txHash) || setAddress(message.address);
        break;
      }
    } catch (e) {
      setError(e);
    }
  };
  React.useEffect(() => {
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  });

  const setIframeRef = (gotIframe) => {
    iframe = gotIframe;
    if (iframe === null) return;
    if (interval4Address)
        clearInterval(interval4Address);
    if (address) return;
    interval4Address = setInterval(() => {
      if (iframe === null) return;
      iframe.contentWindow.postMessage(JSON.stringify({type: "queryAddress"}), "*");
    }, 500);
  };
  switch (status) {
    case "loading":

      break;
    default:

  }

  return (
    <>
      <iframe ref={setIframeRef} style={iframeStyle} src={iframeSrc} title="Wallet"></iframe>

    </>
  );
}

export default App;

import React from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent } from '@material-ui/core';

const iframeStyle = {
  width: "100%",
  height: "640px",
};

const walletOrigin = "https://yopta.net";
// const walletOrigin = "https://walet.velas.com"; prod - not working yet
function App() {
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
export default App;

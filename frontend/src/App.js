// import logo from './logo.svg';
import './App.css';
import React, {useEffect, useRef, useState} from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"
import io from "socket.io-client"



const socket = io("http://localhost:5000", {
    withCredentials: true,
    extraHeaders: {
        "my-custom-header": "abcd"
    }
});

function App() {
  const [ me, setMe ] = useState("")
	const [ stream, setStream ] = useState()
	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ caller, setCaller ] = useState("")
	const [ callerSignal, setCallerSignal ] = useState()
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ idToCall, setIdToCall ] = useState("")
	const [ callEnded, setCallEnded] = useState(false)
	const [ name, setName ] = useState("")
	const myVideo = useRef()
	const userVideo = useRef()
	const connectionRef= useRef()

	useEffect(() => {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			setStream(stream)
				// myVideo.current.srcObject = stream

        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
		})

	socket.on("me", (id) => {
			setMe(id)
      console.log(id)
		})

		socket.on("callUser", (data) => {
			setReceivingCall(true)
			setCaller(data.from)
			setName(data.name)
			setCallerSignal(data.signal)
		})
	}, [])

	const callUser = (id) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {
			
				userVideo.current.srcObject = stream
			
		})
		socket.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer
	}

	const answerCall =() =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream
		})

		peer.signal(callerSignal)
		connectionRef.current = peer
	}

	const leaveCall = () => {
		setCallEnded(true)
		connectionRef.current.destroy()

  }
  return (
    <>
			<h1 style={{ textAlign: "center", color: '#fff' }}>Zoomish</h1>
		<div className="container">
			<div className="video-container">
				<div className="video">
					{stream &&  <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
				</div>
				<div className="video">
					{callAccepted && !callEnded ?
					<video playsInline ref={userVideo} autoPlay style={{ width: "300px"}} />:
					null}
				</div>
			</div>
			
				{/* <TextField
					id="filled-basic"
					label="Name"
					variant="filled"
					value={name}
					onChange={(e) => setName(e.target.value)}
					style={{ marginBottom: "20px" }}
				/> */}
         <div style={{ marginBottom: "20px" }}>
            <label htmlFor="name">Name</label>
            <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    marginBottom: '20px',
                    boxSizing: 'border-box'
                }}
            />
        </div>
				<CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
					{/* <Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
						Copy ID
					</Button> */}
               <button 
            // onClick={handleClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#3f51b5',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
            }}
        >
            <span style={{ marginRight: '8px' }}>
                {/* Remplace l'icône ici */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 0 24 24"
                    width="24px"
                    fill="#fff"
                >
                    <path d="M0 0h24v24H0V0z" fill="none"/>
                    <path d="M10 4v4H3V4c0-1.1.9-2 2-2h3c.55 0 1 .45 1 1zm0 6H3v10c0 1.1.9 2 2 2h3c.55 0 1-.45 1-1v-3h7v3c0 1.1.9 2 2 2h3c1.1 0 2-.9 2-2V10H10zm10-6h-3c-.55 0-1 .45-1 1v3H10V3h10c1.1 0 2 .9 2 2v3h-4V4c0-.55-.45-1-1-1zm-6 8h4v4h-4v-4z"/>
                </svg>
            </span>
            Copy ID
        </button>
				</CopyToClipboard>

				{/* <TextField
					id="filled-basic"
					label="ID to call"
					variant="filled"
					value={idToCall}
					onChange={(e) => setIdToCall(e.target.value)}
				/> */}
        <div style={{ marginBottom: "20px" }}>
            <label htmlFor="id-to-call">ID to call</label>
            <input
                id="id-to-call"
                type="text"
                value={idToCall}
                onChange={(e) => setIdToCall(e.target.value)}
                style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    marginBottom: '20px',
                    boxSizing: 'border-box',
                    backgroundColor: '#f3f3f3' // to imitate the filled variant
                }}
            />
				<div className="call-button">
					{callAccepted && !callEnded ? (
						// <Button variant="contained" color="secondary" onClick={leaveCall}>
						// 	End Call
						// </Button>

              <button 
              onClick={leaveCall}
              style={{
                  display: 'inline-block',
                  backgroundColor: '#f50057', // Correspond à la couleur "secondary" de Material-UI
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  textAlign: 'center'
              }}
              >
              End Call
              </button>
					) : (
						// <IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
						// 	<PhoneIcon fontSize="large" />
						// </IconButton>
            <button
            onClick={() => callUser(idToCall)}
            aria-label="call"
            style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#3f51b5', // Correspond à la couleur "primary" de Material-UI
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                height="32px" // Correspond à fontSize="large"
                viewBox="0 0 24 24"
                width="32px"
                fill="#3f51b5" // Correspond à la couleur "primary" de Material-UI
            >
                <path d="M0 0h24v24H0V0z" fill="none"/>
                <path d="M6.62 10.79a15.53 15.53 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1v3.58c0 .55-.45 1-1 1C7.82 21 2 15.18 2 8c0-.55.45-1 1-1h3.59c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.12.35.03.74-.24 1.02l-2.2 2.2z"/>
            </svg>
        </button>
					)}
					{idToCall}
				</div>
			</div>
			<div>
				{receivingCall && !callAccepted ? (
						<div className="caller">
						<h1 >{name} is calling...</h1>
						{/* <Button variant="contained" color="primary" onClick={answerCall}>
							Answer
						</Button> */}
             <button 
            onClick={answerCall}
            style={{
                display: 'inline-block',
                backgroundColor: '#3f51b5', // Correspond à la couleur "primary" de Material-UI
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                textAlign: 'center'
            }}
        >
            Answer
        </button>
					</div>
				) : null}
			</div>
		</div>
		</>
  );
}

export default App
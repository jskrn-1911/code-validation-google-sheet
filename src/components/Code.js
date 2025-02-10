import React, { useState } from 'react'

const Code = () => {
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [fromVisible, setFormVisible] = useState(false);
    const [userData, setUserData] = useState({
        name: "",
        address: "",
        email: "",
    });

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyuIOJXCwIkU9oF9A79SOr0FSkWefeRHQVfCJjHJGim3nsyaD2w3ZuSS4QDvHjW7o81SQ/exec";

    const validateCode = async () => {
        setLoading(true);
        setMessage("Validating...");
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `action=validate&code=${code}`,
            });
    
            const data = await response.json(); // Ensure you can read the response
            if (data.valid) {
                setFormVisible(true);
                setMessage("");
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setMessage("Something went wrong!");
        }
        setLoading(false);
    };
    
    

    const submitRequest = async () => {
        console.log("user Data:", userData)
        console.log("code:", code)
    };
    return (
        <div className='box'>
            {!fromVisible ? (
                <>
                    <h2>Enter Six-Digit Code</h2>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder='Enter code'
                        maxLength="6"
                    />
                    <button disabled={loading} onClick={validateCode}>{loading ? "wait..." : "Submit"}</button>
                    {message && <p>{message}</p>}
                </>
            ) : (
                <>
                    <h2>Request Your Book</h2>
                    <input
                        type="text"
                        placeholder='Full Name'
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder='Shipping Address'
                        value={userData.address}
                        onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder='Email'
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder='code'
                        value={code}
                        disabled
                    // onChange={(e) => setCode(e.target.value)}
                    />
                    <button disabled={loading} onClick={submitRequest}>{loading ? "wait..." : "Submit Request"}</button>
                </>
            )}
        </div>
    )
}

export default Code

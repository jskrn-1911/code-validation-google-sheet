import React, { useState } from "react";

const Code = () => {
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [userData, setUserData] = useState({
        name: "",
        address: "",
        email: "",
    });

    const AIRTABLE_BASE_ID = "appfoKve7YcNjrzG2";
    const AIRTABLE_TABLE_NAME = "codes";
    const AIRTABLE_REQUESTS_TABLE = "requests";
    const AIRTABLE_ACCESS_TOKEN = process.env.REACT_APP_AIRTABLE_ACCESS_TOKEN
    const validateCode = async () => {
        setLoading(true);
        setMessage("Validating...");

        try {
            const response = await fetch(
                `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=${encodeURIComponent(
                    `{code}='${code}'`
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();
            if (data.records.length > 0) {
                const record = data.records[0];
                if (record.fields.used === true) {
                    setMessage("This code has already been redeemed.");
                } else {
                    // Update the "used" field to true (checkbox)
                    const updateResponse = await fetch(
                        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${record.id}`,
                        {
                            method: "PATCH",
                            headers: {
                                Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                fields: { used: true }, // ✅ Correctly updating the checkbox
                            }),
                        }
                    );

                    if (updateResponse.ok) {
                        setFormVisible(true);
                        setMessage("");
                    } else {
                        setMessage("Error updating code. Please try again.");
                    }
                }
            } else {
                setMessage("Invalid code. Please try again.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setMessage("Something went wrong!");
        }
        setLoading(false);
    };

    const submitRequest = async () => {
        setLoading(true);
        setMessage("Submitting your request...");

        try {
            // Step 1: Store user data in the 'requests' table
            const requestResponse = await fetch(
                `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_REQUESTS_TABLE}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fields: {
                            code: code,
                            fullname: userData.name,
                            address: userData.address,
                            email: userData.email,
                        },
                    }),
                }
            );

            if (!requestResponse.ok) {
                setMessage("Error submitting request. Please try again.");
                setLoading(false);
                return;
            }

            // Step 2: Update the same record in the 'codes' table with user details
            const codeRecordResponse = await fetch(
                `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=${encodeURIComponent(
                    `{code}='${code}'`
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const codeData = await codeRecordResponse.json();
            if (codeData.records.length > 0) {
                const recordId = codeData.records[0].id;

                await fetch(
                    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${recordId}`,
                    {
                        method: "PATCH",
                        headers: {
                            Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            fields: {
                                fullname: userData.name,
                                address: userData.address,
                                email: userData.email,
                            },
                        }),
                    }
                );
            }

            // Success message and reset form
            setMessage("Request submitted successfully! 🎉");
            setUserData({ name: "", address: "", email: "" });
            setCode("");
            setFormVisible(false);

        } catch (error) {
            console.error("Fetch error:", error);
            setMessage("Something went wrong!");
        }

        setLoading(false);
    };

    return (
        <div className="box">
            {!formVisible ? (
                <>
                    <h2>Enter Six-Digit Code</h2>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter code"
                        maxLength="6"
                    />
                    <button disabled={loading} onClick={validateCode}>
                        {loading ? "Wait..." : "Submit"}
                    </button>
                    {message && <p>{message}</p>}
                </>
            ) : (
                <>
                    <h2>Request Your Book</h2>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Shipping Address"
                        value={userData.address}
                        onChange={(e) =>
                            setUserData({ ...userData, address: e.target.value })
                        }
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    />
                    <input type="text" placeholder="Code" value={code} disabled />
                    <button disabled={loading} onClick={submitRequest}>
                        {loading ? "Wait..." : "Submit Request"}
                    </button>
                </>
            )}
        </div>
    );
};

export default Code;

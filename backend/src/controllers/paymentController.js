const PaytmChecksum = require('paytmchecksum');
const SystemSetting = require('../models/SystemSetting');
const https = require('https');

// For development simulation/Sandbbox, use the correct host
const PAYTM_HOST = process.env.PAYTM_HOST || 'securegw-stage.paytm.in';
const PAYTM_MID = process.env.PAYTM_MID; // Should be loaded from DB settings dynamically if possible
const PAYTM_MKEY = process.env.PAYTM_KEY; // Should be loaded from DB settings

/* 
 * 1. Initiate Transaction
 * Generates a transaction token that the frontend can use to start the flow.
 */
exports.initiateTransaction = async (req, res) => {
    const { schoolId } = req.user;
    const { amount, orderId, customerId } = req.body;

    if (!amount || !orderId || !customerId) {
        return res.status(400).json({ error: 'Missing required parameters (amount, orderId, customerId)' });
    }

    try {
        // Fetch credentials from DB if not using ENV
        const settings = await SystemSetting.findOne({ schoolId });
        const paytmConfig = settings?.paymentGateways?.find(g => g.gateway === 'paytm');

        if (!paytmConfig || !paytmConfig.isActive) {
            return res.status(400).json({ error: 'Paytm gateway is not active' });
        }

        const MID = paytmConfig.config.keyId; // Using keyId as MID
        const MKEY = paytmConfig.config.keySecret; // Using keySecret as Merchant Key

        if (!MID || !MKEY) {
            return res.status(500).json({ error: 'Paytm credentials missing in configuration' });
        }

        const paytmParams = {};

        paytmParams.body = {
            "requestType": "Payment",
            "mid": MID,
            "websiteName": "WEBSTAGING", // Change to "DEFAULT" for Production
            "orderId": orderId,
            "callbackUrl": `${process.env.API_URL || 'http://localhost:5000'}/api/payment/callback`, // Callback to backend
            "txnAmount": {
                "value": amount.toString(),
                "currency": "INR",
            },
            "userInfo": {
                "custId": customerId,
            },
        };

        const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), MKEY);

        paytmParams.head = {
            "signature": checksum
        };

        const post_data = JSON.stringify(paytmParams);

        const options = {
            hostname: 'securegw-stage.paytm.in', // Use securegw.paytm.in for production
            port: 443,
            path: `/theia/api/v1/initiateTransaction?mid=${MID}&orderId=${orderId}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': post_data.length
            }
        };

        let response = "";
        const post_req = https.request(options, function (post_res) {
            post_res.on('data', function (chunk) {
                response += chunk;
            });

            post_res.on('end', function () {
                const result = JSON.parse(response);
                if (result.body && result.body.txnToken) {
                    res.json({
                        success: true,
                        txnToken: result.body.txnToken,
                        orderId: orderId,
                        mid: MID,
                        amount: amount
                    });
                } else {
                    res.status(500).json({ success: false, error: result.body?.resultInfo?.resultMsg || 'Initiation failed' });
                }
            });
        });

        post_req.write(post_data);
        post_req.end();

    } catch (error) {
        console.error("Paytm Init Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/*
 * 2. Callback URL (Optional / Server-to-Server)
 * Paytm posts here after transaction. We verify checksum.
 */
exports.handleCallback = async (req, res) => {
    // Note: This endpoint is hit by Paytm server (POST).
    // Usually we verify checksum and update DB status.
    // Assuming backend verify logic.

    console.log("Paytm Callback Params:", req.body);

    // For now, simpler for frontend to verify status independently or listen to this
    // We can redirect user to frontend success/failure page
    res.redirect(`http://localhost:3000/dashboard/student/fees/status?orderId=${req.body.ORDERID}`);
};

/*
 * 3. Search/Status Check (Transaction Status API)
 */
exports.checkStatus = async (req, res) => {
    const { orderId, schoolId } = req.body;

    try {
        const settings = await SystemSetting.findOne({ schoolId: req.user.schoolId });
        const paytmConfig = settings?.paymentGateways?.find(g => g.gateway === 'paytm');
        const MID = paytmConfig?.config?.keyId;
        const MKEY = paytmConfig?.config?.keySecret;

        if (!MID || !MKEY) return res.status(500).json({ error: "Config missing" });

        const paytmParams = {};
        paytmParams.body = {
            "mid": MID,
            "orderId": orderId,
        };

        const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), MKEY);
        paytmParams.head = { "signature": checksum };

        const post_data = JSON.stringify(paytmParams);

        const options = {
            hostname: 'securegw-stage.paytm.in',
            port: 443,
            path: '/v3/order/status',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': post_data.length
            }
        };

        let response = "";
        const post_req = https.request(options, function (post_res) {
            post_res.on('data', function (chunk) { response += chunk; });
            post_res.on('end', function () {
                const result = JSON.parse(response);
                res.json(result);
            });
        });

        post_req.write(post_data);
        post_req.end();

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

import FormData from 'form-data'
import axios from 'axios'
import dotenv from 'dotenv'
import fs from 'fs'

async function login() {
    dotenv.config();
    const formData = new FormData();
    formData.append('1_email', process.env.MERCURY_EMAIL);
    formData.append('1_password', process.env.MERCURY_PASSWORD);
    formData.append('0', '["$undefined","$K1"]');

    const headers = {
        'accept': 'text/x-component',
        'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8',
        'content-type': 'multipart/form-data; boundary=' + formData._boundary,
        'next-action': '7a2a2aa6eb6d1955601964159c71cb5870ce0454',
        'next-router-state-tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22login%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
        'origin': 'https://test.mercurydata.app',
        'priority': 'u=1, i',
        'referer': 'https://test.mercurydata.app/login',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0'
    };

    try {
        const response = await axios.post('https://test.mercurydata.app/login', formData, { headers, validateStatus: status => status < 400 });

        const responseData = response.data;

        // Extract the JWT
        const jwtRegex = /"jwt":{"name":"jwt","value":"(.*?)"/;
        const match = jwtRegex.exec(responseData);

        if (match && match[1]) {
            const jwt = match[1];
            fs.writeFileSync('.env', `
VITE_API_TOKEN=${jwt}
MERCURY_EMAIL=${process.env.MERCURY_EMAIL}
MERCURY_PASSWORD=${process.env.MERCURY_PASSWORD}
                `);
            console.log("saved jwt to .env file");

        } else {
            console.error('JWT not found in response.');
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

login();
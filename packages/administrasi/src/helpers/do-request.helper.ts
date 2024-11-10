import axios from "axios"

const BASE_URL = "http://localhost:3000"

const doRequest = axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        'x-company-id': localStorage.getItem('company') || null
    }
})

doRequest.interceptors.request.use(function (config) {
    return config
}, function (error) {
    return Promise.reject(error);
})


doRequest.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error.response.data);
});

export default doRequest

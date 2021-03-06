import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

interface RequestConfig extends AxiosRequestConfig {
  responseEncoding?: string;
}

const DEFAULT_API_CONFIG: RequestConfig = {
  method: 'GET',
  headers: {},
  responseType: 'json',
  responseEncoding: 'utf8',
  withCredentials: true,
  timeout: 30000,
};

axios.defaults.baseURL = 'http://localhost:3000';

axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (!config.url) return Promise.resolve({});

    if (!/login|register/.test(config.url)) {
      config.headers['Token'] = ''; // getToken
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response: AxiosResponse<IAnyObject>) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default function request(api: string, config: AxiosRequestConfig = {}) {
  return new Promise((resolve, reject) => {
    config.url = api;
    config.method = config.method || DEFAULT_API_CONFIG.method;

    config[config.method?.toLowerCase() === 'get' ? 'params' : 'data'] =
      config.data;

    config.headers = {
      ...DEFAULT_API_CONFIG.headers,
      ...config.headers,
    };

    axios({
      ...DEFAULT_API_CONFIG,
      ...config,
    })
      .then((resp) => {
        const { status, data = {} } = resp;
        if (status !== 200) {
          return reject({
            status: data.status || status,
            message: data.msg || '出错了,请稍后再试！',
            data,
            api,
          });
        }
        return resolve(data);
      })
      .catch((error) => reject(error));
  });
}

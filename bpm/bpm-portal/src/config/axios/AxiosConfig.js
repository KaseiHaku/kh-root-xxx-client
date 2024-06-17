import {PresetAxios as axios} from '@kaseihaku.com/cloud-starter-basic';
import Constant from '@/constant/BpmPortalConstant.js';

axios.defaults.baseURL = Constant.axios.defaultBaseURL;

export default axios;

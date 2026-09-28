import {config} from 'dotenv';
import base from './vitest.config.ts';
config({path:'.env.local',quiet:true});
export default {...base,test:{...base.test,include:['tests/integration/database.spec.ts']}};

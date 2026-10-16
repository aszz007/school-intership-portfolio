import {handleRequest} from '../../server/handler.mjs';
export const onRequest = context => handleRequest(context.request, context.env);

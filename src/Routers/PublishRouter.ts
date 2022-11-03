#!/usr/bin/env node
import {
    WithRabbitmq,
    Middleware,
    WithMysql,
} from "../Tools"

const router = require("express").Router();

class PublishRouter{

}

const publish = new PublishRouter();
const middleware = new Middleware();

export default router;
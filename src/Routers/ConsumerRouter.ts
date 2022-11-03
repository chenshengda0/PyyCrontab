#!/usr/bin/env node
import {
    WithRabbitmq,
    Middleware,
    WithMysql,
} from "../Tools"

const router = require("express").Router();

class ConsumerRouter{

}

const consumer = new ConsumerRouter();
const middleware = new Middleware();

export default router;
#!/usr/bin/env node

/*
    Copyright 2020 Smart Charging Solutions

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

import yargs from "yargs"
import { Registry } from "./registry"
import { getPartyBuilder, setPartyBuilder, setPartyModulesBuilder } from "./builders"
import { PartyDetails, Role, Module } from "./types"
import { networks } from "./networks"

yargs
    .option("network", {
        alias: ["net", "n"],
        choices: Object.keys(networks),
        describe: "Specifies the target network.",
        default: "local"
    })
    .option("signer", {
        alias: "s",
        string: true,
        describe: "Data owner's private key. Required for modifying contract state.",
    })
    .option("spender", {
        alias: "x",
        string: true,
        describe: "Spender's private key. Required for sending raw transactions."
    })
    .command("get-node <address>", "Get SCN Node operator entry by their wallet address", () => {}, async (args) => {
        const registry = new Registry(args.network)
        const result = await registry.getNode(args.address as string)
        console.log(result || "Node operator not listed in registry.")
    })
    .command("list-nodes", "Get all SCN Nodes listed in registry", () => {}, async (args) => {
        const registry = new Registry(args.network)
        const result = await registry.getAllNodes()
        console.log(JSON.stringify(result, null, 2))
    })
    .command("set-node <domain>", "Create or update SCN Node operator entry", () => {}, async (args) => {
        const signer = process.env.SIGNER || args.signer
        const registry = new Registry(args.network, signer)
        const result = await registry.setNode(args.domain as string)
        console.log(result)
    })
    .command("set-node-raw <domain>", "Create or update SCN Node operator entry using raw transaction", () => {}, async (args) => {
        const signer = process.env.SIGNER || args.signer
        const spender = process.env.SPENDER || args.spender
        const registry = new Registry(args.network, spender)
        const result = await registry.setNodeRaw(args.domain as string, signer as string)
        console.log(result)
    })
    .command("delete-node", "Delete SCN Node operator entry", () => {}, async (args) => {
        const signer = process.env.SIGNER || args.signer
        const registry = new Registry(args.network, signer)
        const result = await registry.deleteNode()
        console.log(result)
    })
    .command("delete-node-raw", "Delete SCN Node operator entry using raw transaction", () => {}, async (args) => {
        const signer = process.env.SIGNER || args.signer
        const spender = process.env.SPENDER || args.spender
        const registry = new Registry(args.network, spender)
        const result = await registry.deleteNodeRaw(signer as string)
        console.log(result)
    })
    .command("get-party", "Get SCPI party entry listed in the registry", getPartyBuilder, async (args) => {
        const registry = new Registry(args.network)
        let result: PartyDetails | undefined
        if (args.address) {
            result = await registry.getPartyByAddress(args.address as string)
        } else {
            const [countryCode, partyId] = args.credentials as string[]
            result = await registry.getPartyByScpi(countryCode, partyId)
        }
        console.log(result ? JSON.stringify(result, null, 2) : "SCPI Party not listed in registry.")
    })
    .command("list-parties", "List all SCPI parties listed in registry", () => {}, async (args) => {
        const registry = new Registry(args.network as string)
        const result = await registry.getAllParties()
        console.log(JSON.stringify(result, null, 2))
    })
    .command("set-party", "Create or update SCPI party entry", setPartyBuilder, async (args) => {
        const signer = process.env.SIGNER || args.signer
        const registry = new Registry(args.network, signer)
        const [countryCode, partyId] = args.credentials as string[]
        const roles: Role[] = Array.from(new Set(args.roles as string[])).map(role => Role[role])
        const result = await registry.setParty(countryCode, partyId, roles, args.operator as string)
        console.log(result)
    })
    .command("set-party-raw", "Create or update SCPI party entry using raw transaction", setPartyBuilder, async (args) => {
        const signer = process.env.SIGNER || args.signer
        const spender = process.env.SPENDER || args.spender
        const registry = new Registry(args.network, spender)
        const [countryCode, partyId] = args.credentials as string[]
        const roles: Role[] = Array.from(new Set(args.roles as string[])).map(role => Role[role])
        const result = await registry.setPartyRaw(countryCode, partyId, roles, args.operator as string, signer as string)
        console.log(result)
    })
    .command(["set-party-modules", "set-modules"], "Set SCPI module implementations for an SCPI party", setPartyModulesBuilder, async (args) => {
        const signer = process.env.SIGNER || args.signer
        const registry = new Registry(args.network, signer)
        const sender: Module[] = Array.from(new Set(args.si as string[] || [])).map(mod => Module[mod])
        const receiver: Module[] = Array.from(new Set(args.ri as string[] || [])).map(mod => Module[mod])
        const result = await registry.setPartyModules(sender, receiver)
        console.log(result)
    })
    .command(["set-party-modules-raw", "set-modules-raw"], "Set SCPI module implementations for an SCPI party using raw transaction", setPartyModulesBuilder, async (args) => {
        const signer = process.env.SIGNER || args.signer
        const spender = process.env.SPENDER || args.spender
        const registry = new Registry(args.network, spender)
        const sender: Module[] = Array.from(new Set(args.si as string[] || [])).map(mod => Module[mod])
        const receiver: Module[] = Array.from(new Set(args.ri as string[] || [])).map(mod => Module[mod])
        const result = await registry.setPartyModulesRaw(sender, receiver, signer as string)
        console.log(result)
    })
    .command("delete-party", "Remove SCPI party entry", () => {}, async (args) => {
        const signer = process.env.SIGNER || args.signer
        const registry = new Registry(args.network, signer)
        const result = await registry.deleteParty()
        console.log(result)
    })
    .command("delete-party-raw", "Remove SCPI party entry by raw transaction", () => {}, async (args) => {
        const signer = process.env.SIGNER || args.signer
        const spender = process.env.SPENDER || args.spender
        const registry = new Registry(args.network, spender)
        const result = await registry.deletePartyRaw(signer as string)
        console.log(result)
    })
    .completion()
    .group(["version", "help"], "Information:")
    .group(["signer", "spender"], "Transactions:")
    .help()
    .parse()

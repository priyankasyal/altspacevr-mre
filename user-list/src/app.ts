/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import FakeUser from './fakeUser';
import { addUserToStorageList, deleteUserFromList } from './httpClient';
//import fetchJSON from './fetchJSON';
//import { webhost } from './server';
/**
 * The main class of this app. All the logic goes here.
 */
export class UserList {
	public root: MRE.Actor = null;
	public assets: MRE.AssetContainer;
	private userMap = new Map<MRE.Guid, string>();

	constructor(public context: MRE.Context, params: MRE.ParameterSet) {
		this.assets = new MRE.AssetContainer(this.context);
		context.onStarted(() => this.started());

		if (params['mode'] === 'testing') {
			this.test();
		}
		else {
			context.onUserJoined(user => this.userJoined(user));
			context.onUserLeft(user => this.userLeft(user));

		}
	}

	private  started() {
		this.root = MRE.Actor.Create(this.context, {
			actor: { name: 'Root' }
		});

		
		//console.log("the context is " + this.prettyPrint(this.context.getStats()));
		
		for (const userId in this.userMap) {
			//add the user in the db and show in the list
		}
	}

	private async userJoined(user: MRE.UserLike): Promise<void>  {
		
		if (user instanceof MRE.User) {

		await addUserToStorageList(user.name);
		//add user to the list
		this.userMap.set(user.id, user.name);
		
		}
		
		
		//send this list to db
	}

	private async userLeft(user: MRE.User): 
	Promise<void> {
		//await getStorageList(user.name);
		if (this.userMap.has(user.id)) {
			const userToRemove = this.userMap.get(user.id);
			this.userMap.delete(user.id);
			await deleteUserFromList(user.name);
			//delete user from the db or update the list in the db
		}
	}

	private prettyPrint(stats: MRE.PerformanceStats) {
		const plainStats = stats as any;
		let pp = '';
		for (const k in plainStats) {
			// eslint-disable-next-line no-prototype-builtins
			if (!plainStats.hasOwnProperty(k)) { continue; }
			const v = plainStats[k];
			if (Array.isArray(v)) {
				const arrayString = v
					.map((n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 3 }))
					.join(' / ');
				pp += `${k}: ${arrayString}\n`;
			} else {
				pp += `${k}: ${v}\n`;
			}
		}
		return pp.trim();
	}

	

	private test(): void {
		//change this
		this.userJoined(new FakeUser('Seattle', '216.243.34.181'));
		this.userJoined(new FakeUser('Richmond', '208.253.114.165'));
		this.userJoined(new FakeUser('Sydney', '121.200.30.147'));
		this.userJoined(new FakeUser('Shanghai', '116.236.216.116'));
	}
}

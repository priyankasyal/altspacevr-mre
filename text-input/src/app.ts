/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

/**
 * The main class of this app. All the logic goes here.
 */
export default class PromptText {
	private assets: MRE.AssetContainer;
	private buttonMaterial: MRE.Material;
	private whiteboardMaterial: MRE.Material;

	private whiteboard: MRE.Actor;
	constructor(private context: MRE.Context) {
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);
		this.buttonMaterial = this.assets.createMaterial('buttonMaterial', {
			color: MRE.Color3.Gray()
		});
		const buttonMesh = this.assets.createBoxMesh('button', 1.2, .2, .01);

		//add button for adding text
		const textButton = MRE.Actor.Create(this.context, {
			actor: {
				name: 'textButton',
				transform: { local: { position: { x: 0.5, y: 0.01, z: 0 } } },
				appearance: {
					meshId: buttonMesh.id,
					materialId: this.buttonMaterial.id
				},
				collider: { geometry: { shape: MRE.ColliderType.Auto } }
			
				
			}
		});

		const eraseButton = MRE.Actor.Create(this.context, {
			actor: {
				name: 'eraseButton',
				transform: { local: { position: { x: 0.6, y: 0.01, z: 0 } } },
				appearance: {
					meshId: buttonMesh.id,
					materialId: this.buttonMaterial.id
				},
				collider: { geometry: { shape: MRE.ColliderType.Auto } }
			
				
			}
		});
		
		const surfaceMesh = this.assets.createBoxMesh('drawSurface', 2, 1, .01);
		this.whiteboardMaterial = this.assets.createMaterial('whiteboardMaterial', {
			color: MRE.Color3.White()
		});
		/*
		// Create draw surface
		this.whiteboard = MRE.Actor.Create(this.context, {
			actor: {
				name: 'whiteboardSurface',
				transform: { local: { position: { y: 1.2 } } },
				appearance: { meshId: surfaceMesh.id, materialId: this.whiteboardMaterial.id
				},
				collider: { geometry: { shape: MRE.ColliderType.Auto} }
			}
		});
		
		// Create label for draw surface.
		MRE.Actor.Create(this.context, {
			actor: {
				name: 'label',
				parentId: this.whiteboard.id,
				transform: { local: { position: { y: 0.6} } },
				text: {
					contents: 'Use surface to hover and point\n Click/press to draw over',
					height: 0.1,
					anchor: MRE.TextAnchorLocation.BottomCenter,
					color: MRE.Color3.White()
				}
			}
		});
	*/
		//add button label
		/*const eraseButtonLabel = MRE.Actor.Create(this.context, {actor: {
				name: 'label',
				parentId: textButton.id,
				transform: { local: { position: {x: 0, y: -0.05, z: -0.012 } } },
				text: {
					contents: 'Click to erase in the chat',
					height: 0.1,
					anchor: MRE.TextAnchorLocation.BottomCenter,
					justify: MRE.TextJustify.Center,
					color: MRE.Color3.White()
				}
				
		}});*/
		//add button label
		const buttonLabel = MRE.Actor.Create(this.context, {actor: {
			name: 'label',
			parentId: textButton.id,
			transform: { local: { position: {x: 0, y: -0.05, z: -0.012 } } },
			text: {
				contents: 'Click to type in the chat',
				height: 0.1,
				anchor: MRE.TextAnchorLocation.BottomCenter,
				justify: MRE.TextJustify.Center,
				color: MRE.Color3.White()
			}
			
		}});
		//textChat surface
		const textChat = MRE.Actor.Create(this.context, {actor: {
			name: 'label1',
			parentId: textButton.id,
			transform: { local: { position: { x:0, y: 0.8 } } },
			text: {
				contents: 'Response',
				height: 0.1,
				anchor: MRE.TextAnchorLocation.TopCenter,
				justify: MRE.TextJustify.Center
			}
		}});
		//prompt text
		textButton.setBehavior(MRE.ButtonBehavior).onClick(user => {
			user.prompt(`Hi ${user.name}, do you have any questions or feedback?`, true)
			.then(res => {
				let prev = textChat.text.contents;
				if(res.submitted) {
		
					textChat.text.contents =
					prev + `\n${user.name}: ${res.submitted ? res.text : "<cancelled>"}`;
				}
			})
			.catch(err => {
				console.error(err);
			});
		});
	}		
}

/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

/**
 * The main class of this app. All the logic goes here.
 */
export default class Whiteboard {
	public expectedResultDescription = "Draw on the surface to place red ink";

	private whiteboard: MRE.Actor;
	private eraseAllButton: MRE.Actor;
	private whiteboardBehaviour: MRE.ButtonBehavior;
	private assets: MRE.AssetContainer;
	private drawMesh: MRE.Mesh;
	private hoverPointerMaterial: MRE.Material;
	private drawPointerMaterial: MRE.Material;
	private buttonMaterial: MRE.Material;
	private whiteboardMaterial: MRE.Material;
	private drawObjects: MRE.Actor[] = [];


	constructor(private context: MRE.Context) {
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);
		
		this.drawMesh = this.assets.createBoxMesh('drawPoint', .03,0.03,.03);
		this.hoverPointerMaterial = this.assets.createMaterial('hoverPointerMaterial', {
			color: MRE.Color3.Blue()
		});
		this.drawPointerMaterial = this.assets.createMaterial('drawPointerMaterial', {
			color: MRE.Color3.Black()
		})

		this.createDrawSurface();
		this.createEraseButton();

		// Create scene light
		MRE.Actor.Create(this.context, {
			actor: {
				name: "Light",
				light: {
					type: 'point',
					range: 5,
					intensity: 2,
					color: { r: 0, g: 0, b: 0 }
				},
				transform: {
					local: {
						position: { x: -2, y: 2, z: -2 }
					}
				}
			}
		});

		return true;
	}

	private spawnTargetObjects(targetingState: 'hover' | 'draw', drawPoints: MRE.Vector3Like[]) {
		const materialId = (targetingState === 'hover') ? this.hoverPointerMaterial.id : this.drawPointerMaterial.id;

		const drawActors = drawPoints.map(drawPoint => {
			return MRE.Actor.Create(this.context, {
				actor: {
					name: targetingState === 'hover' ? 'hoverBall' : 'drawBall',
					parentId: this.whiteboard.id,
					transform: { local: { position: drawPoint } },
					appearance: {
						materialId: materialId,
						meshId: this.drawMesh.id
					}
				}
			});
		});

		if (targetingState === 'hover') {
			// Set lifetime timer for the hover points.
			setTimeout(() => drawActors.forEach(actor => actor.destroy()), 500);
		} else {
			this.drawObjects = this.drawObjects.concat(drawActors);
		}
	}

	private eraseDrawObjects() {
		this.drawObjects.forEach(actor => actor.destroy());
		this.drawObjects = [];
	}

	private createDrawSurface() {
		const surfaceMesh = this.assets.createBoxMesh('drawSurface', 2, 1, .01);
		this.whiteboardMaterial = this.assets.createMaterial('whiteboardMaterial', {
			color: MRE.Color3.White()
		});
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

		this.whiteboardBehaviour = this.whiteboard.setBehavior(MRE.ButtonBehavior);
		
		// Hover handlers
		this.whiteboardBehaviour.onHover('enter', (_, data: MRE.ButtonEventData) => {
			this.spawnTargetObjects('hover', data.targetedPoints.map(pointData => pointData.localSpacePoint));
		});
		this.whiteboardBehaviour.onHover('hovering', (_, data) => {
			this.spawnTargetObjects('hover', data.targetedPoints.map(pointData => pointData.localSpacePoint));
		});
		this.whiteboardBehaviour.onHover('exit', (_, data: MRE.ButtonEventData) => {
			this.spawnTargetObjects('hover', data.targetedPoints.map(pointData => pointData.localSpacePoint));
		});

		// Button handlers
		this.whiteboardBehaviour.onButton('pressed', (_, data: MRE.ButtonEventData) => {
			this.spawnTargetObjects('draw', data.targetedPoints.map(pointData => pointData.localSpacePoint));
		});
		this.whiteboardBehaviour.onButton('holding', (_, data) => {
			this.spawnTargetObjects('draw', data.targetedPoints.map(pointData => pointData.localSpacePoint));
		});
		this.whiteboardBehaviour.onButton('released', (_, data: MRE.ButtonEventData) => {
			this.spawnTargetObjects('draw', data.targetedPoints.map(pointData => pointData.localSpacePoint));
		});
	}
	
	private createEraseButton() {
		// Create erase button for the surface
		this.buttonMaterial = this.assets.createMaterial('buttonMaterial', {
			color: MRE.Color3.Gray()
		});
		const buttonMesh = this.assets.createBoxMesh('eraseButton', .2, .2, .01);
		this.eraseAllButton = MRE.Actor.Create(this.context, {
			actor: {
				name: 'eraseButton',
				parentId: this.whiteboard.id,
				transform: { local: { position: { y: -.7 } } },
				appearance: { meshId: buttonMesh.id, materialId: this.buttonMaterial.id },
				collider: { geometry: { shape: MRE.ColliderType.Auto } }
			}
		});
		MRE.Actor.Create(this.context, {
			actor: {
				name: 'eraseButtonLabel',
				parentId: this.eraseAllButton.id,
				transform: { local: { position: { y: -.3 } } },
				text: {
					contents: "Click Button to Erase Surface",
					height: .1,
					anchor: MRE.TextAnchorLocation.BottomCenter,
					color: MRE.Color3.White()
				}
			}
		})

		const eraseButtonBehavior = this.eraseAllButton.setBehavior(MRE.ButtonBehavior);
		eraseButtonBehavior.onClick((_, __) => this.eraseDrawObjects());
	}
		
}

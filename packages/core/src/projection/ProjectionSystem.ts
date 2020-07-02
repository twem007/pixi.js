import { System } from '../System';
import { Matrix } from '@pixi/math';

import type { Rectangle } from '@pixi/math';
import type { Renderer } from '../Renderer';

/**
 * System plugin to the renderer to manage the projection matrix.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */

export class ProjectionSystem extends System
{
    public destinationFrame: Rectangle;
    public sourceFrame: Rectangle;
    public defaultFrame: Rectangle;
    public projectionMatrix: Matrix;
    public transform: Matrix;
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

        /**
         * Destination frame
         * @member {PIXI.Rectangle}
         * @readonly
         */
        this.destinationFrame = null;

        /**
         * Source frame
         * @member {PIXI.Rectangle}
         * @readonly
         */
        this.sourceFrame = null;

        /**
         * Default destination frame
         * @member {PIXI.Rectangle}
         * @readonly
         */
        this.defaultFrame = null;

        /**
         * Project matrix
         * @member {PIXI.Matrix}
         * @readonly
         */
        this.projectionMatrix = new Matrix();

        /**
         * A transform that will be appended to the projection matrix
         * if null, nothing will be applied
         * @member {PIXI.Matrix}
         */
        this.transform = null;
    }

    /**
     * Updates the projection matrix based on a projection frame (which is a rectangle).
     *
     * Make sure to run `renderer.framebuffer.setViewport(destinationFrame)` after calling this.
     *
     * @param {PIXI.Rectangle} destinationFrame - The destination frame.
     * @param {PIXI.Rectangle} sourceFrame - The source frame.
     * @param {Number} resolution - Resolution
     * @param {boolean} root - If is root
     */
    update(destinationFrame: Rectangle, sourceFrame: Rectangle, resolution: number, root: boolean): void
    {
        this.destinationFrame = destinationFrame || this.destinationFrame || this.defaultFrame;
        this.sourceFrame = sourceFrame || this.sourceFrame || destinationFrame;

        // Calculate object-space to clip-space projection
        this.calculateProjection(this.destinationFrame, this.sourceFrame, resolution, root);

        if (this.transform)
        {
            this.projectionMatrix.append(this.transform);
        }

        const renderer =  this.renderer;

        renderer.globalUniforms.uniforms.projectionMatrix = this.projectionMatrix;
        renderer.globalUniforms.update();

        // this will work for now
        // but would be sweet to stick and even on the global uniforms..
        if (renderer.shader.shader)
        {
            renderer.shader.syncUniformGroup(renderer.shader.shader.uniforms.globals);
        }
    }

    /**
     * Updates the projection matrix based on a projection frame (which is a rectangle)
     *
     * @param {PIXI.Rectangle}[destinationFrame] - The destination frame.
     * @param {PIXI.Rectangle} sourceFrame - The source frame.
     * @param {Number} resolution - Resolution
     * @param {boolean} root - If is root
     */
    calculateProjection(_destinationFrame: Rectangle, sourceFrame: Rectangle, _resolution: number, root: boolean): void
    {
        const pm = this.projectionMatrix;
        const sign = !root ? 1 : -1;

        // I don't think we will need this line..
        // pm.identity();

        pm.a = (1 / sourceFrame.width * 2);
        pm.d = sign * (1 / sourceFrame.height * 2);

        pm.tx = -1 - (sourceFrame.x * pm.a);
        pm.ty = -sign - (sourceFrame.y * pm.d);
    }

    /**
     * Sets the transform of the active render target to the given matrix
     *
     * @param {PIXI.Matrix} matrix - The transformation matrix
     */
    setTransform(_matrix: Matrix): void
    {
        // this._activeRenderTarget.transform = matrix;
    }
}

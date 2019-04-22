/// <reference path="../fluxions/Fluxions.ts" />

// CS482CGS Computer Graphics Simulations
namespace CS482CGS {
    interface GraphicsApp {
        OnUpdate(dt: number): void;
        OnRender(rc: FxRenderingContext): void;
        OnRenderOverlay(rc: FxRenderingContext): void;
    }

    interface Renderable {
        Render(rc: FxRenderingContext): void;
    }

    class LagrangianSimElement {
        position = new Vector3();
        constructor() { }
    }

    class EulerianSimElement {
        constructor() { }
    }

    class EulerianSim implements Renderable {
        cells: Array<EulerianSimElement> = [];

        constructor(readonly cellCount: Vector3) {
            this.cellCount = cellCount.bitOR(0);
        }

        Render(rc: FxRenderingContext): void {

        }
    }

    class SimulationApp implements GraphicsApp {

        constructor(private rc: FxRenderingContext) {
        }

        OnUpdate(dt: number): void {
        }

        OnRender(rc: FxRenderingContext): void {
        }

        OnRenderOverlay(rc: FxRenderingContext): void {
        }
    }
}
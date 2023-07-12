import { useRef, useState } from "react";
import { useEffect } from "react";
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useThree } from "@react-three/fiber";
import {
  CameraHelper,
  OrthographicCamera,
  PerspectiveCamera,
  WebGLRenderer,
} from "three";

export function useCameraHelper() {
  const { gl, scene, camera } = useThree();
  const helperCamera = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 3, 50), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const helper = useMemo(() => new CameraHelper(camera), []);
  const div1Ref = useRef<HTMLDivElement>();
  const div2Ref = useRef<HTMLDivElement>();
  // const controls = useMemo(() => new OrbitControls(helperCamera), [])
  const [controls, setControls] = useState<OrbitControls>()
  scene.add(helper);
  useEffect(() => {
    const [div1, div2] = appendDom(gl.domElement.parentElement);
    div1Ref.current = div1;
    div2Ref.current = div2;
    const orbitControls = new OrbitControls(helperCamera, div1)
    setControls(orbitControls)
    orbitControls.target.set(0, 5, 0);
    orbitControls.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    gl.setScissorTest(true);
    if (div1Ref.current && div2Ref.current) {
      {
        const aspect = setScissorForElement(gl, div1Ref.current);
        helperCamera.left = -aspect;
        helperCamera.right = aspect;
        helperCamera.updateProjectionMatrix();
        helper.visible = true;
        helper.update();

        gl.render(scene, helperCamera);
      }

      {
        const aspect = setScissorForElement(gl, div2Ref.current);
        if (camera instanceof PerspectiveCamera) {
          camera.aspect = aspect;
        } else {
          helperCamera.left = -aspect;
          helperCamera.right = aspect;
        }
        camera.updateProjectionMatrix();
        helper.visible = false;
        helper.update();
        gl.render(scene, camera);
      }
    }
  });

  return [helperCamera, controls]
}

function appendDom(root: HTMLElement | null) {
  const split = document.createElement("div");
  split.style.cssText =
    "position: absolute;left: 0;top: 0;width: 100%;height: 100%;display: flex;";
  const div1 = document.createElement("div");
  div1.style.cssText = "width: 100%;height: 100%;";
  const div2 = document.createElement("div");
  div2.style.cssText = "width: 100%;height: 100%;";
  split.appendChild(div1);
  split.appendChild(div2);
  root?.appendChild(split);

  return [div1, div2];
}

function setScissorForElement(render: WebGLRenderer, elem: HTMLDivElement) {
  const canvasRect = render.domElement.getBoundingClientRect();
  const elemRect = elem.getBoundingClientRect();

  // compute a canvas relative rectangle
  const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
  const left = Math.max(0, elemRect.left - canvasRect.left);
  const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
  const top = Math.max(0, elemRect.top - canvasRect.top);

  const width = Math.min(canvasRect.width, right - left);
  const height = Math.min(canvasRect.height, bottom - top);

  // setup the scissor to only render to that part of the canvas
  const positiveYUpBottom = canvasRect.height - bottom;
  render.setScissor(left, positiveYUpBottom, width, height);
  render.setViewport(left, positiveYUpBottom, width, height);

  // return the aspect
  return width / height;
}

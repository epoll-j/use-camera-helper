# useCameraHelper
This hook automatically adds additional cameras and crops the screen to better showcase camerahelper.

This hook is dependent on [@react-three/fiber](https://github.com/pmndrs/react-three-fiber)

## Install

```
npm i @epoll-j/use-camera-helper
```

## Usage

```
import { useCameraHelper } from "@epoll-j/use-camera-helper";

export const Example = () => {
  ...
  const [helperCamera, helperControl] = useCameraHelper()
  ...
}

```
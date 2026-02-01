const glsl = String.raw;

async function main() {
  const canvas = document.querySelector("#orb") as HTMLCanvasElement;
  const gl = canvas.getContext("webgl2")!;

  const size = 267;
  
  canvas.width = size;
  canvas.height = size;
  gl.viewport(0, 0, size, size);

  const vertSrc = glsl`
    #version 300 es
    in vec2 a_position;
    out vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      v_uv.y = 1.0 - v_uv.y;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `.trim();

  const fragDither = glsl`
    #version 300 es
    precision highp float;
    in vec2 v_uv;
    out vec4 fragColor;
    uniform vec2 resolution;
    uniform vec2 center;
    uniform bool lightDark;
    float random(vec2 c) {
      return fract(sin(dot(c.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    vec3 handleTheme(float value) {
      if (!lightDark) {
        return vec3(value);
      } else {
        return vec3(1.0 - value);
      }
    }

    float orderedDither(vec2 uv, float lum) {
      mat4 bayerMatrix4x4 =
        mat4(
           0.0,  8.0,  2.0, 10.0,
          12.0,  4.0, 14.0,  6.0,
           3.0, 11.0,  1.0,  9.0,
          15.0,  7.0, 13.0,  5.0
        ) /
        16.0;

      int x = int(uv.x * resolution.x) % 4;
      int y = int(uv.y * resolution.y) % 4;
      float threshold = bayerMatrix4x4[y][x];

      float value = 1.0;
      if (lum < threshold) {
        value = 0.0;
      } 
      
      return value;
    }

    void main() {
      float xc = (v_uv.x - 0.5) * resolution.x / resolution.y;
      float yc = v_uv.y - 0.5;
      if (!(xc * xc + yc * yc < 0.5 * 0.5)) {
        fragColor = vec4(handleTheme(1.0), 1.0);
        return;
      }
      vec2 toCenter = (v_uv - center) * vec2(resolution.x / resolution.y, 1.0);
      float dist = length(toCenter) / 0.5;
      fragColor = vec4(handleTheme(orderedDither(v_uv, dist * dist)), 1.0);
    }
  `.trim();

  function createProgram(fragSrc: string) {
    const vertShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertShader, vertSrc);
    gl.compileShader(vertShader);

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragShader, fragSrc);
    gl.compileShader(fragShader);

    const blurProgram = gl.createProgram()!;
    gl.attachShader(blurProgram, vertShader);
    gl.attachShader(blurProgram, fragShader);
    gl.linkProgram(blurProgram);
    return blurProgram;
  }

  const blurProgram = createProgram(fragDither);

  // Full-screen quad
  const verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

  let center = [0.5, 0.5];
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function render() {
	canvas.style.opacity = 1;
    gl.useProgram(blurProgram);

    const posLoc = gl.getAttribLocation(blurProgram, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const resolutionLoc = gl.getUniformLocation(blurProgram, "resolution");
    gl.uniform2f(resolutionLoc, size, size);

      const texelSizeLoc = gl.getUniformLocation(blurProgram, "u_texelSize");
      if (texelSizeLoc !== -1) {
        gl.uniform2f(texelSizeLoc, 1 / size, 1 / size);
      }
  
      const centerLoc = gl.getUniformLocation(blurProgram, "center");
      if (centerLoc !== -1) {
        gl.uniform2f(centerLoc, center[0]!, center[1]!);
      }

      const lightDarkLoc = gl.getUniformLocation(blurProgram, "lightDark");
      gl.uniform1i(lightDarkLoc, mediaQuery.matches ? 1 : 0);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
  document.addEventListener('mousemove', (event) => {
    const offsetX = clamp(event.clientX - canvas.getBoundingClientRect().left, 0, size);
    const offsetY = clamp(event.clientY - canvas.getBoundingClientRect().top, 0, size);
      let x = (offsetX / size) - 0.5;
      let y = (offsetY / size) - 0.5;

      

      const distanceFromCenter = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
      const MAX = 0.4;
      let newDistance = Math.pow(distanceFromCenter, 1.5);
      if (newDistance > MAX) {
          newDistance = MAX;
      }

      x = x * newDistance / distanceFromCenter;
      y = y * newDistance / distanceFromCenter;
      center = [x + 0.5, y + 0.5];
      render();
  });

  mediaQuery.addEventListener("change", (e) => {
    render();
  }); 
}

main().catch(console.error);

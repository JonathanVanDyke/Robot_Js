

window.onload = () => {

  //!STATS
  /**
 * @author mrdoob / http://mrdoob.com/
 */

  var Stats = function () {

    var mode = 0;

    var container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
    container.addEventListener('click', function (event) {

      event.preventDefault();
      showPanel(++mode % container.children.length);

    }, false);

    //

    function addPanel(panel) {

      container.appendChild(panel.dom);
      return panel;

    }

    function showPanel(id) {

      for (var i = 0; i < container.children.length; i++) {

        container.children[i].style.display = i === id ? 'block' : 'none';

      }

      mode = id;

    }

    //

    var beginTime = (performance || Date).now(), prevTime = beginTime, frames = 0;

    var fpsPanel = addPanel(new Stats.Panel('FPS', '#0ff', '#002'));
    var msPanel = addPanel(new Stats.Panel('MS', '#0f0', '#020'));

    if (self.performance && self.performance.memory) {

      var memPanel = addPanel(new Stats.Panel('MB', '#f08', '#201'));

    }

    showPanel(0);

    return {

      REVISION: 16,

      dom: container,

      addPanel: addPanel,
      showPanel: showPanel,

      begin: function () {

        beginTime = (performance || Date).now();

      },

      end: function () {

        frames++;

        var time = (performance || Date).now();

        msPanel.update(time - beginTime, 200);

        if (time >= prevTime + 1000) {

          fpsPanel.update((frames * 1000) / (time - prevTime), 100);

          prevTime = time;
          frames = 0;

          if (memPanel) {

            var memory = performance.memory;
            memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);

          }

        }

        return time;

      },

      update: function () {

        beginTime = this.end();

      },

      // Backwards Compatibility

      domElement: container,
      setMode: showPanel

    };

  };

  Stats.Panel = function (name, fg, bg) {

    var min = Infinity, max = 0, round = Math.round;
    var PR = round(window.devicePixelRatio || 1);

    var WIDTH = 80 * PR, HEIGHT = 48 * PR,
      TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
      GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
      GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

    var canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = 'width:80px;height:48px';

    var context = canvas.getContext('2d');
    context.font = 'bold ' + (9 * PR) + 'px Helvetica,Arial,sans-serif';
    context.textBaseline = 'top';

    context.fillStyle = bg;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = fg;
    context.fillText(name, TEXT_X, TEXT_Y);
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

    context.fillStyle = bg;
    context.globalAlpha = 0.9;
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

    return {

      dom: canvas,

      update: function (value, maxValue) {

        min = Math.min(min, value);
        max = Math.max(max, value);

        context.fillStyle = bg;
        context.globalAlpha = 1;
        context.fillRect(0, 0, WIDTH, GRAPH_Y);
        context.fillStyle = fg;
        context.fillText(round(value) + ' ' + name + ' (' + round(min) + '-' + round(max) + ')', TEXT_X, TEXT_Y);

        context.drawImage(canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);

        context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);

        context.fillStyle = bg;
        context.globalAlpha = 0.9;
        context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - (value / maxValue)) * GRAPH_HEIGHT));

      }

    };

  };
  //!STATS

  //!TerrainLoader
  /**
 * @author Bjorn Sandvik / http://thematicmapping.org/
 */

  THREE.TerrainLoader = function (manager) {

    this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;

  };

  THREE.TerrainLoader.prototype = {

    constructor: THREE.TerrainLoader,

    load: function (url, onLoad, onProgress, onError) {

      var scope = this;
      var request = new XMLHttpRequest();

      if (onLoad !== undefined) {

        request.addEventListener('load', function (event) {

          onLoad(new Uint16Array(event.target.response));
          scope.manager.itemEnd(url);

        }, false);

      }

      if (onProgress !== undefined) {

        request.addEventListener('progress', function (event) {

          onProgress(event);

        }, false);

      }

      if (onError !== undefined) {

        request.addEventListener('error', function (event) {

          onError(event);

        }, false);

      }

      if (this.crossOrigin !== undefined) request.crossOrigin = this.crossOrigin;

      request.open('GET', url, true);

      request.responseType = 'arraybuffer';

      request.send(null);

      scope.manager.itemStart(url);

    },

    setCrossOrigin: function (value) {

      this.crossOrigin = value;

    }

  };

  //!GLTFLoader
  let socket = io.connect();
  /**
   * @author Rich Tibbett / https://github.com/richtr
   * @author mrdoob / http://mrdoob.com/
   * @author Tony Parisi / http://www.tonyparisi.com/
   * @author Takahiro / https://github.com/takahirox
   * @author Don McCurdy / https://www.donmccurdy.com
   */

  THREE.GLTFLoader = (function () {

    function GLTFLoader(manager) {

      THREE.Loader.call(this, manager);

      this.dracoLoader = null;
      this.ddsLoader = null;

    }

    GLTFLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {

      constructor: GLTFLoader,

      load: function (url, onLoad, onProgress, onError) {

        var scope = this;

        var resourcePath;

        if (this.resourcePath !== '') {

          resourcePath = this.resourcePath;

        } else if (this.path !== '') {

          resourcePath = this.path;

        } else {

          resourcePath = THREE.LoaderUtils.extractUrlBase(url);

        }

        // Tells the LoadingManager to track an extra item, which resolves after
        // the model is fully loaded. This means the count of items loaded will
        // be incorrect, but ensures manager.onLoad() does not fire early.
        // debugger
        scope.manager.itemStart(url);

        var _onError = function (e) {

          if (onError) {

            onError(e);

          } else {

            console.error(e);

          }

          scope.manager.itemError(url);
          scope.manager.itemEnd(url);

        };

        var loader = new THREE.FileLoader(scope.manager);

        loader.setPath(this.path);
        loader.setResponseType('arraybuffer');

        if (scope.crossOrigin === 'use-credentials') {

          loader.setWithCredentials(true);

        }

        loader.load(url, function (data) {

          try {

            scope.parse(data, resourcePath, function (gltf) {

              onLoad(gltf);

              scope.manager.itemEnd(url);

            }, _onError);

          } catch (e) {

            _onError(e);

          }

        }, onProgress, _onError);

      },

      setDRACOLoader: function (dracoLoader) {

        this.dracoLoader = dracoLoader;
        return this;

      },

      setDDSLoader: function (ddsLoader) {

        this.ddsLoader = ddsLoader;
        return this;

      },

      parse: function (data, path, onLoad, onError) {

        var content;
        var extensions = {};

        if (typeof data === 'string') {

          content = data;

        } else {

          var magic = THREE.LoaderUtils.decodeText(new Uint8Array(data, 0, 4));

          if (magic === BINARY_EXTENSION_HEADER_MAGIC) {

            try {

              extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data);

            } catch (error) {

              if (onError) onError(error);
              return;

            }

            content = extensions[EXTENSIONS.KHR_BINARY_GLTF].content;

          } else {

            content = THREE.LoaderUtils.decodeText(new Uint8Array(data));

          }

        }

        var json = JSON.parse(content);

        if (json.asset === undefined || json.asset.version[0] < 2) {

          if (onError) onError(new Error('THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported. Use LegacyGLTFLoader instead.'));
          return;

        }

        if (json.extensionsUsed) {

          for (var i = 0; i < json.extensionsUsed.length; ++i) {

            var extensionName = json.extensionsUsed[i];
            var extensionsRequired = json.extensionsRequired || [];

            switch (extensionName) {

              case EXTENSIONS.KHR_LIGHTS_PUNCTUAL:
                extensions[extensionName] = new GLTFLightsExtension(json);
                break;

              case EXTENSIONS.KHR_MATERIALS_UNLIT:
                extensions[extensionName] = new GLTFMaterialsUnlitExtension();
                break;

              case EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:
                extensions[extensionName] = new GLTFMaterialsPbrSpecularGlossinessExtension();
                break;

              case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
                extensions[extensionName] = new GLTFDracoMeshCompressionExtension(json, this.dracoLoader);
                break;

              case EXTENSIONS.MSFT_TEXTURE_DDS:
                extensions[EXTENSIONS.MSFT_TEXTURE_DDS] = new GLTFTextureDDSExtension(this.ddsLoader);
                break;

              case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
                extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] = new GLTFTextureTransformExtension();
                break;

              default:

                if (extensionsRequired.indexOf(extensionName) >= 0) {

                  console.warn('THREE.GLTFLoader: Unknown extension "' + extensionName + '".');

                }

            }

          }

        }

        var parser = new GLTFParser(json, extensions, {

          path: path || this.resourcePath || '',
          crossOrigin: this.crossOrigin,
          manager: this.manager

        });

        parser.parse(onLoad, onError);

      }

    });

    /* GLTFREGISTRY */

    function GLTFRegistry() {

      var objects = {};

      return {

        get: function (key) {

          return objects[key];

        },

        add: function (key, object) {

          objects[key] = object;

        },

        remove: function (key) {

          delete objects[key];

        },

        removeAll: function () {

          objects = {};

        }

      };

    }

    /*********************************/
    /********** EXTENSIONS ***********/
    /*********************************/

    var EXTENSIONS = {
      KHR_BINARY_GLTF: 'KHR_binary_glTF',
      KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
      KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
      KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
      KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
      KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
      MSFT_TEXTURE_DDS: 'MSFT_texture_dds'
    };

    /**
     * DDS Texture Extension
     *
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/MSFT_texture_dds
     *
     */
    function GLTFTextureDDSExtension(ddsLoader) {

      if (!ddsLoader) {

        throw new Error('THREE.GLTFLoader: Attempting to load .dds texture without importing THREE.DDSLoader');

      }

      this.name = EXTENSIONS.MSFT_TEXTURE_DDS;
      this.ddsLoader = ddsLoader;

    }

    /**
     * Punctual Lights Extension
     *
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
     */
    function GLTFLightsExtension(json) {

      this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;

      var extension = (json.extensions && json.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL]) || {};
      this.lightDefs = extension.lights || [];

    }

    GLTFLightsExtension.prototype.loadLight = function (lightIndex) {

      var lightDef = this.lightDefs[lightIndex];
      var lightNode;

      var color = new THREE.Color(0xffffff);
      if (lightDef.color !== undefined) color.fromArray(lightDef.color);

      var range = lightDef.range !== undefined ? lightDef.range : 0;

      switch (lightDef.type) {

        case 'directional':
          lightNode = new THREE.DirectionalLight(color);
          lightNode.target.position.set(0, 0, - 1);
          lightNode.add(lightNode.target);
          break;

        case 'point':
          lightNode = new THREE.PointLight(color);
          lightNode.distance = range;
          break;

        case 'spot':
          lightNode = new THREE.SpotLight(color);
          lightNode.distance = range;
          // Handle spotlight properties.
          lightDef.spot = lightDef.spot || {};
          lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== undefined ? lightDef.spot.innerConeAngle : 0;
          lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== undefined ? lightDef.spot.outerConeAngle : Math.PI / 4.0;
          lightNode.angle = lightDef.spot.outerConeAngle;
          lightNode.penumbra = 1.0 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
          lightNode.target.position.set(0, 0, - 1);
          lightNode.add(lightNode.target);
          break;

        default:
          throw new Error('THREE.GLTFLoader: Unexpected light type, "' + lightDef.type + '".');

      }

      // Some lights (e.g. spot) default to a position other than the origin. Reset the position
      // here, because node-level parsing will only override position if explicitly specified.
      lightNode.position.set(0, 0, 0);

      lightNode.decay = 2;

      if (lightDef.intensity !== undefined) lightNode.intensity = lightDef.intensity;

      lightNode.name = lightDef.name || ('light_' + lightIndex);

      return Promise.resolve(lightNode);

    };

    /**
     * Unlit Materials Extension
     *
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
     */
    function GLTFMaterialsUnlitExtension() {

      this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;

    }

    GLTFMaterialsUnlitExtension.prototype.getMaterialType = function () {

      return THREE.MeshBasicMaterial;

    };

    GLTFMaterialsUnlitExtension.prototype.extendParams = function (materialParams, materialDef, parser) {

      var pending = [];

      materialParams.color = new THREE.Color(1.0, 1.0, 1.0);
      materialParams.opacity = 1.0;

      var metallicRoughness = materialDef.pbrMetallicRoughness;

      if (metallicRoughness) {

        if (Array.isArray(metallicRoughness.baseColorFactor)) {

          var array = metallicRoughness.baseColorFactor;

          materialParams.color.fromArray(array);
          materialParams.opacity = array[3];

        }

        if (metallicRoughness.baseColorTexture !== undefined) {

          pending.push(parser.assignTexture(materialParams, 'map', metallicRoughness.baseColorTexture));

        }

      }

      return Promise.all(pending);

    };

    /* BINARY EXTENSION */
    var BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
    var BINARY_EXTENSION_HEADER_LENGTH = 12;
    var BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

    function GLTFBinaryExtension(data) {

      this.name = EXTENSIONS.KHR_BINARY_GLTF;
      this.content = null;
      this.body = null;

      var headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);

      this.header = {
        magic: THREE.LoaderUtils.decodeText(new Uint8Array(data.slice(0, 4))),
        version: headerView.getUint32(4, true),
        length: headerView.getUint32(8, true)
      };

      if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {

        throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.');

      } else if (this.header.version < 2.0) {

        throw new Error('THREE.GLTFLoader: Legacy binary file detected. Use LegacyGLTFLoader instead.');

      }

      var chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
      var chunkIndex = 0;

      while (chunkIndex < chunkView.byteLength) {

        var chunkLength = chunkView.getUint32(chunkIndex, true);
        chunkIndex += 4;

        var chunkType = chunkView.getUint32(chunkIndex, true);
        chunkIndex += 4;

        if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {

          var contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength);
          this.content = THREE.LoaderUtils.decodeText(contentArray);

        } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {

          var byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
          this.body = data.slice(byteOffset, byteOffset + chunkLength);

        }

        // Clients must ignore chunks with unknown types.

        chunkIndex += chunkLength;

      }

      if (this.content === null) {

        throw new Error('THREE.GLTFLoader: JSON content not found.');

      }

    }

    /**
     * DRACO Mesh Compression Extension
     *
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
     */
    function GLTFDracoMeshCompressionExtension(json, dracoLoader) {

      if (!dracoLoader) {

        throw new Error('THREE.GLTFLoader: No DRACOLoader instance provided.');

      }

      this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
      this.json = json;
      this.dracoLoader = dracoLoader;

    }

    GLTFDracoMeshCompressionExtension.prototype.decodePrimitive = function (primitive, parser) {

      var json = this.json;
      var dracoLoader = this.dracoLoader;
      var bufferViewIndex = primitive.extensions[this.name].bufferView;
      var gltfAttributeMap = primitive.extensions[this.name].attributes;
      var threeAttributeMap = {};
      var attributeNormalizedMap = {};
      var attributeTypeMap = {};

      for (var attributeName in gltfAttributeMap) {

        var threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();

        threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName];

      }

      for (attributeName in primitive.attributes) {

        var threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();

        if (gltfAttributeMap[attributeName] !== undefined) {

          var accessorDef = json.accessors[primitive.attributes[attributeName]];
          var componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType];

          attributeTypeMap[threeAttributeName] = componentType;
          attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true;

        }

      }

      return parser.getDependency('bufferView', bufferViewIndex).then(function (bufferView) {

        return new Promise(function (resolve) {

          dracoLoader.decodeDracoFile(bufferView, function (geometry) {

            for (var attributeName in geometry.attributes) {

              var attribute = geometry.attributes[attributeName];
              var normalized = attributeNormalizedMap[attributeName];

              if (normalized !== undefined) attribute.normalized = normalized;

            }

            resolve(geometry);

          }, threeAttributeMap, attributeTypeMap);

        });

      });

    };

    /**
     * Texture Transform Extension
     *
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
     */
    function GLTFTextureTransformExtension() {

      this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;

    }

    GLTFTextureTransformExtension.prototype.extendTexture = function (texture, transform) {

      texture = texture.clone();

      if (transform.offset !== undefined) {

        texture.offset.fromArray(transform.offset);

      }

      if (transform.rotation !== undefined) {

        texture.rotation = transform.rotation;

      }

      if (transform.scale !== undefined) {

        texture.repeat.fromArray(transform.scale);

      }

      if (transform.texCoord !== undefined) {

        console.warn('THREE.GLTFLoader: Custom UV sets in "' + this.name + '" extension not yet supported.');

      }

      texture.needsUpdate = true;

      return texture;

    };

    /**
     * Specular-Glossiness Extension
     *
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness
     */
    function GLTFMaterialsPbrSpecularGlossinessExtension() {

      return {

        name: EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS,

        specularGlossinessParams: [
          'color',
          'map',
          'lightMap',
          'lightMapIntensity',
          'aoMap',
          'aoMapIntensity',
          'emissive',
          'emissiveIntensity',
          'emissiveMap',
          'bumpMap',
          'bumpScale',
          'normalMap',
          'displacementMap',
          'displacementScale',
          'displacementBias',
          'specularMap',
          'specular',
          'glossinessMap',
          'glossiness',
          'alphaMap',
          'envMap',
          'envMapIntensity',
          'refractionRatio',
        ],

        getMaterialType: function () {

          return THREE.ShaderMaterial;

        },

        extendParams: function (materialParams, materialDef, parser) {

          var pbrSpecularGlossiness = materialDef.extensions[this.name];

          var shader = THREE.ShaderLib['standard'];

          var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

          var specularMapParsFragmentChunk = [
            '#ifdef USE_SPECULARMAP',
            '	uniform sampler2D specularMap;',
            '#endif'
          ].join('\n');

          var glossinessMapParsFragmentChunk = [
            '#ifdef USE_GLOSSINESSMAP',
            '	uniform sampler2D glossinessMap;',
            '#endif'
          ].join('\n');

          var specularMapFragmentChunk = [
            'vec3 specularFactor = specular;',
            '#ifdef USE_SPECULARMAP',
            '	vec4 texelSpecular = texture2D( specularMap, vUv );',
            '	texelSpecular = sRGBToLinear( texelSpecular );',
            '	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture',
            '	specularFactor *= texelSpecular.rgb;',
            '#endif'
          ].join('\n');

          var glossinessMapFragmentChunk = [
            'float glossinessFactor = glossiness;',
            '#ifdef USE_GLOSSINESSMAP',
            '	vec4 texelGlossiness = texture2D( glossinessMap, vUv );',
            '	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture',
            '	glossinessFactor *= texelGlossiness.a;',
            '#endif'
          ].join('\n');

          var lightPhysicalFragmentChunk = [
            'PhysicalMaterial material;',
            'material.diffuseColor = diffuseColor.rgb;',
            'material.specularRoughness = clamp( 1.0 - glossinessFactor, 0.04, 1.0 );',
            'material.specularColor = specularFactor.rgb;',
          ].join('\n');

          var fragmentShader = shader.fragmentShader
            .replace('uniform float roughness;', 'uniform vec3 specular;')
            .replace('uniform float metalness;', 'uniform float glossiness;')
            .replace('#include <roughnessmap_pars_fragment>', specularMapParsFragmentChunk)
            .replace('#include <metalnessmap_pars_fragment>', glossinessMapParsFragmentChunk)
            .replace('#include <roughnessmap_fragment>', specularMapFragmentChunk)
            .replace('#include <metalnessmap_fragment>', glossinessMapFragmentChunk)
            .replace('#include <lights_physical_fragment>', lightPhysicalFragmentChunk);

          delete uniforms.roughness;
          delete uniforms.metalness;
          delete uniforms.roughnessMap;
          delete uniforms.metalnessMap;

          uniforms.specular = { value: new THREE.Color().setHex(0x111111) };
          uniforms.glossiness = { value: 0.5 };
          uniforms.specularMap = { value: null };
          uniforms.glossinessMap = { value: null };

          materialParams.vertexShader = shader.vertexShader;
          materialParams.fragmentShader = fragmentShader;
          materialParams.uniforms = uniforms;
          materialParams.defines = { 'STANDARD': '' };

          materialParams.color = new THREE.Color(1.0, 1.0, 1.0);
          materialParams.opacity = 1.0;

          var pending = [];

          if (Array.isArray(pbrSpecularGlossiness.diffuseFactor)) {

            var array = pbrSpecularGlossiness.diffuseFactor;

            materialParams.color.fromArray(array);
            materialParams.opacity = array[3];

          }

          if (pbrSpecularGlossiness.diffuseTexture !== undefined) {

            pending.push(parser.assignTexture(materialParams, 'map', pbrSpecularGlossiness.diffuseTexture));

          }

          materialParams.emissive = new THREE.Color(0.0, 0.0, 0.0);
          materialParams.glossiness = pbrSpecularGlossiness.glossinessFactor !== undefined ? pbrSpecularGlossiness.glossinessFactor : 1.0;
          materialParams.specular = new THREE.Color(1.0, 1.0, 1.0);

          if (Array.isArray(pbrSpecularGlossiness.specularFactor)) {

            materialParams.specular.fromArray(pbrSpecularGlossiness.specularFactor);

          }

          if (pbrSpecularGlossiness.specularGlossinessTexture !== undefined) {

            var specGlossMapDef = pbrSpecularGlossiness.specularGlossinessTexture;
            pending.push(parser.assignTexture(materialParams, 'glossinessMap', specGlossMapDef));
            pending.push(parser.assignTexture(materialParams, 'specularMap', specGlossMapDef));

          }

          return Promise.all(pending);

        },

        createMaterial: function (params) {

          // setup material properties based on MeshStandardMaterial for Specular-Glossiness

          var material = new THREE.ShaderMaterial({
            defines: params.defines,
            vertexShader: params.vertexShader,
            fragmentShader: params.fragmentShader,
            uniforms: params.uniforms,
            fog: true,
            lights: true,
            opacity: params.opacity,
            transparent: params.transparent
          });

          material.isGLTFSpecularGlossinessMaterial = true;

          material.color = params.color;

          material.map = params.map === undefined ? null : params.map;

          material.lightMap = null;
          material.lightMapIntensity = 1.0;

          material.aoMap = params.aoMap === undefined ? null : params.aoMap;
          material.aoMapIntensity = 1.0;

          material.emissive = params.emissive;
          material.emissiveIntensity = 1.0;
          material.emissiveMap = params.emissiveMap === undefined ? null : params.emissiveMap;

          material.bumpMap = params.bumpMap === undefined ? null : params.bumpMap;
          material.bumpScale = 1;

          material.normalMap = params.normalMap === undefined ? null : params.normalMap;

          if (params.normalScale) material.normalScale = params.normalScale;

          material.displacementMap = null;
          material.displacementScale = 1;
          material.displacementBias = 0;

          material.specularMap = params.specularMap === undefined ? null : params.specularMap;
          material.specular = params.specular;

          material.glossinessMap = params.glossinessMap === undefined ? null : params.glossinessMap;
          material.glossiness = params.glossiness;

          material.alphaMap = null;

          material.envMap = params.envMap === undefined ? null : params.envMap;
          material.envMapIntensity = 1.0;

          material.refractionRatio = 0.98;

          material.extensions.derivatives = true;

          return material;

        },

        /**
         * Clones a GLTFSpecularGlossinessMaterial instance. The ShaderMaterial.copy() method can
         * copy only properties it knows about or inherits, and misses many properties that would
         * normally be defined by MeshStandardMaterial.
         *
         * This method allows GLTFSpecularGlossinessMaterials to be cloned in the process of
         * loading a glTF model, but cloning later (e.g. by the user) would require these changes
         * AND also updating `.onBeforeRender` on the parent mesh.
         *
         * @param  {THREE.ShaderMaterial} source
         * @return {THREE.ShaderMaterial}
         */
        cloneMaterial: function (source) {

          var target = source.clone();

          target.isGLTFSpecularGlossinessMaterial = true;

          var params = this.specularGlossinessParams;

          for (var i = 0, il = params.length; i < il; i++) {

            var value = source[params[i]];
            target[params[i]] = (value && value.isColor) ? value.clone() : value;

          }

          return target;

        },

        // Here's based on refreshUniformsCommon() and refreshUniformsStandard() in WebGLRenderer.
        refreshUniforms: function (renderer, scene, camera, geometry, material) {

          if (material.isGLTFSpecularGlossinessMaterial !== true) {

            return;

          }

          var uniforms = material.uniforms;
          var defines = material.defines;

          uniforms.opacity.value = material.opacity;

          uniforms.diffuse.value.copy(material.color);
          uniforms.emissive.value.copy(material.emissive).multiplyScalar(material.emissiveIntensity);

          uniforms.map.value = material.map;
          uniforms.specularMap.value = material.specularMap;
          uniforms.alphaMap.value = material.alphaMap;

          uniforms.lightMap.value = material.lightMap;
          uniforms.lightMapIntensity.value = material.lightMapIntensity;

          uniforms.aoMap.value = material.aoMap;
          uniforms.aoMapIntensity.value = material.aoMapIntensity;

          // uv repeat and offset setting priorities
          // 1. color map
          // 2. specular map
          // 3. normal map
          // 4. bump map
          // 5. alpha map
          // 6. emissive map

          var uvScaleMap;

          if (material.map) {

            uvScaleMap = material.map;

          } else if (material.specularMap) {

            uvScaleMap = material.specularMap;

          } else if (material.displacementMap) {

            uvScaleMap = material.displacementMap;

          } else if (material.normalMap) {

            uvScaleMap = material.normalMap;

          } else if (material.bumpMap) {

            uvScaleMap = material.bumpMap;

          } else if (material.glossinessMap) {

            uvScaleMap = material.glossinessMap;

          } else if (material.alphaMap) {

            uvScaleMap = material.alphaMap;

          } else if (material.emissiveMap) {

            uvScaleMap = material.emissiveMap;

          }

          if (uvScaleMap !== undefined) {

            // backwards compatibility
            if (uvScaleMap.isWebGLRenderTarget) {

              uvScaleMap = uvScaleMap.texture;

            }

            if (uvScaleMap.matrixAutoUpdate === true) {

              uvScaleMap.updateMatrix();

            }

            uniforms.uvTransform.value.copy(uvScaleMap.matrix);

          }

          if (material.envMap) {

            uniforms.envMap.value = material.envMap;
            uniforms.envMapIntensity.value = material.envMapIntensity;

            // don't flip CubeTexture envMaps, flip everything else:
            //  WebGLRenderTargetCube will be flipped for backwards compatibility
            //  WebGLRenderTargetCube.texture will be flipped because it's a Texture and NOT a CubeTexture
            // this check must be handled differently, or removed entirely, if WebGLRenderTargetCube uses a CubeTexture in the future
            uniforms.flipEnvMap.value = material.envMap.isCubeTexture ? - 1 : 1;

            uniforms.reflectivity.value = material.reflectivity;
            uniforms.refractionRatio.value = material.refractionRatio;

            uniforms.maxMipLevel.value = renderer.properties.get(material.envMap).__maxMipLevel;

          }

          uniforms.specular.value.copy(material.specular);
          uniforms.glossiness.value = material.glossiness;

          uniforms.glossinessMap.value = material.glossinessMap;

          uniforms.emissiveMap.value = material.emissiveMap;
          uniforms.bumpMap.value = material.bumpMap;
          uniforms.normalMap.value = material.normalMap;

          uniforms.displacementMap.value = material.displacementMap;
          uniforms.displacementScale.value = material.displacementScale;
          uniforms.displacementBias.value = material.displacementBias;

          if (uniforms.glossinessMap.value !== null && defines.USE_GLOSSINESSMAP === undefined) {

            defines.USE_GLOSSINESSMAP = '';
            // set USE_ROUGHNESSMAP to enable vUv
            defines.USE_ROUGHNESSMAP = '';

          }

          if (uniforms.glossinessMap.value === null && defines.USE_GLOSSINESSMAP !== undefined) {

            delete defines.USE_GLOSSINESSMAP;
            delete defines.USE_ROUGHNESSMAP;

          }

        }

      };

    }

    /*********************************/
    /********** INTERPOLATION ********/
    /*********************************/

    // Spline Interpolation
    // Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#appendix-c-spline-interpolation
    function GLTFCubicSplineInterpolant(parameterPositions, sampleValues, sampleSize, resultBuffer) {

      THREE.Interpolant.call(this, parameterPositions, sampleValues, sampleSize, resultBuffer);

    }

    GLTFCubicSplineInterpolant.prototype = Object.create(THREE.Interpolant.prototype);
    GLTFCubicSplineInterpolant.prototype.constructor = GLTFCubicSplineInterpolant;

    GLTFCubicSplineInterpolant.prototype.copySampleValue_ = function (index) {

      // Copies a sample value to the result buffer. See description of glTF
      // CUBICSPLINE values layout in interpolate_() function below.

      var result = this.resultBuffer,
        values = this.sampleValues,
        valueSize = this.valueSize,
        offset = index * valueSize * 3 + valueSize;

      for (var i = 0; i !== valueSize; i++) {

        result[i] = values[offset + i];

      }

      return result;

    };

    GLTFCubicSplineInterpolant.prototype.beforeStart_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;

    GLTFCubicSplineInterpolant.prototype.afterEnd_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;

    GLTFCubicSplineInterpolant.prototype.interpolate_ = function (i1, t0, t, t1) {

      var result = this.resultBuffer;
      var values = this.sampleValues;
      var stride = this.valueSize;

      var stride2 = stride * 2;
      var stride3 = stride * 3;

      var td = t1 - t0;

      var p = (t - t0) / td;
      var pp = p * p;
      var ppp = pp * p;

      var offset1 = i1 * stride3;
      var offset0 = offset1 - stride3;

      var s2 = - 2 * ppp + 3 * pp;
      var s3 = ppp - pp;
      var s0 = 1 - s2;
      var s1 = s3 - pp + p;

      // Layout of keyframe output values for CUBICSPLINE animations:
      //   [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]
      for (var i = 0; i !== stride; i++) {

        var p0 = values[offset0 + i + stride]; // splineVertex_k
        var m0 = values[offset0 + i + stride2] * td; // outTangent_k * (t_k+1 - t_k)
        var p1 = values[offset1 + i + stride]; // splineVertex_k+1
        var m1 = values[offset1 + i] * td; // inTangent_k+1 * (t_k+1 - t_k)

        result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;

      }

      return result;

    };

    /*********************************/
    /********** INTERNALS ************/
    /*********************************/

    /* CONSTANTS */

    var WEBGL_CONSTANTS = {
      FLOAT: 5126,
      //FLOAT_MAT2: 35674,
      FLOAT_MAT3: 35675,
      FLOAT_MAT4: 35676,
      FLOAT_VEC2: 35664,
      FLOAT_VEC3: 35665,
      FLOAT_VEC4: 35666,
      LINEAR: 9729,
      REPEAT: 10497,
      SAMPLER_2D: 35678,
      POINTS: 0,
      LINES: 1,
      LINE_LOOP: 2,
      LINE_STRIP: 3,
      TRIANGLES: 4,
      TRIANGLE_STRIP: 5,
      TRIANGLE_FAN: 6,
      UNSIGNED_BYTE: 5121,
      UNSIGNED_SHORT: 5123
    };

    var WEBGL_COMPONENT_TYPES = {
      5120: Int8Array,
      5121: Uint8Array,
      5122: Int16Array,
      5123: Uint16Array,
      5125: Uint32Array,
      5126: Float32Array
    };

    var WEBGL_FILTERS = {
      9728: THREE.NearestFilter,
      9729: THREE.LinearFilter,
      9984: THREE.NearestMipmapNearestFilter,
      9985: THREE.LinearMipmapNearestFilter,
      9986: THREE.NearestMipmapLinearFilter,
      9987: THREE.LinearMipmapLinearFilter
    };

    var WEBGL_WRAPPINGS = {
      33071: THREE.ClampToEdgeWrapping,
      33648: THREE.MirroredRepeatWrapping,
      10497: THREE.RepeatWrapping
    };

    var WEBGL_TYPE_SIZES = {
      'SCALAR': 1,
      'VEC2': 2,
      'VEC3': 3,
      'VEC4': 4,
      'MAT2': 4,
      'MAT3': 9,
      'MAT4': 16
    };

    var ATTRIBUTES = {
      POSITION: 'position',
      NORMAL: 'normal',
      TANGENT: 'tangent',
      TEXCOORD_0: 'uv',
      TEXCOORD_1: 'uv2',
      COLOR_0: 'color',
      WEIGHTS_0: 'skinWeight',
      JOINTS_0: 'skinIndex',
    };

    var PATH_PROPERTIES = {
      scale: 'scale',
      translation: 'position',
      rotation: 'quaternion',
      weights: 'morphTargetInfluences'
    };

    var INTERPOLATION = {
      CUBICSPLINE: undefined, // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
      // keyframe track will be initialized with a default interpolation type, then modified.
      LINEAR: THREE.InterpolateLinear,
      STEP: THREE.InterpolateDiscrete
    };

    var ALPHA_MODES = {
      OPAQUE: 'OPAQUE',
      MASK: 'MASK',
      BLEND: 'BLEND'
    };

    var MIME_TYPE_FORMATS = {
      'image/png': THREE.RGBAFormat,
      'image/jpeg': THREE.RGBFormat
    };

    /* UTILITY FUNCTIONS */

    function resolveURL(url, path) {

      // Invalid URL
      if (typeof url !== 'string' || url === '') return '';

      // Host Relative URL
      if (/^https?:\/\//i.test(path) && /^\//.test(url)) {

        path = path.replace(/(^https?:\/\/[^\/]+).*/i, '$1');

      }

      // Absolute URL http://,https://,//
      if (/^(https?:)?\/\//i.test(url)) return url;

      // Data URI
      if (/^data:.*,.*$/i.test(url)) return url;

      // Blob URL
      if (/^blob:.*$/i.test(url)) return url;

      // Relative URL
      return path + url;

    }

    var defaultMaterial;

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
     */
    function createDefaultMaterial() {

      defaultMaterial = defaultMaterial || new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        emissive: 0x000000,
        metalness: 1,
        roughness: 1,
        transparent: false,
        depthTest: true,
        side: THREE.FrontSide
      });

      return defaultMaterial;

    }

    function addUnknownExtensionsToUserData(knownExtensions, object, objectDef) {

      // Add unknown glTF extensions to an object's userData.

      for (var name in objectDef.extensions) {

        if (knownExtensions[name] === undefined) {

          object.userData.gltfExtensions = object.userData.gltfExtensions || {};
          object.userData.gltfExtensions[name] = objectDef.extensions[name];

        }

      }

    }

    /**
     * @param {THREE.Object3D|THREE.Material|THREE.BufferGeometry} object
     * @param {GLTF.definition} gltfDef
     */
    function assignExtrasToUserData(object, gltfDef) {

      if (gltfDef.extras !== undefined) {

        if (typeof gltfDef.extras === 'object') {

          Object.assign(object.userData, gltfDef.extras);

        } else {

          console.warn('THREE.GLTFLoader: Ignoring primitive type .extras, ' + gltfDef.extras);

        }

      }

    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#morph-targets
     *
     * @param {THREE.BufferGeometry} geometry
     * @param {Array<GLTF.Target>} targets
     * @param {GLTFParser} parser
     * @return {Promise<THREE.BufferGeometry>}
     */
    function addMorphTargets(geometry, targets, parser) {

      var hasMorphPosition = false;
      var hasMorphNormal = false;

      for (var i = 0, il = targets.length; i < il; i++) {

        var target = targets[i];

        if (target.POSITION !== undefined) hasMorphPosition = true;
        if (target.NORMAL !== undefined) hasMorphNormal = true;

        if (hasMorphPosition && hasMorphNormal) break;

      }

      if (!hasMorphPosition && !hasMorphNormal) return Promise.resolve(geometry);

      var pendingPositionAccessors = [];
      var pendingNormalAccessors = [];

      for (var i = 0, il = targets.length; i < il; i++) {

        var target = targets[i];

        if (hasMorphPosition) {

          var pendingAccessor = target.POSITION !== undefined
            ? parser.getDependency('accessor', target.POSITION)
            : geometry.attributes.position;

          pendingPositionAccessors.push(pendingAccessor);

        }

        if (hasMorphNormal) {

          var pendingAccessor = target.NORMAL !== undefined
            ? parser.getDependency('accessor', target.NORMAL)
            : geometry.attributes.normal;

          pendingNormalAccessors.push(pendingAccessor);

        }

      }

      return Promise.all([
        Promise.all(pendingPositionAccessors),
        Promise.all(pendingNormalAccessors)
      ]).then(function (accessors) {

        var morphPositions = accessors[0];
        var morphNormals = accessors[1];

        // Clone morph target accessors before modifying them.

        for (var i = 0, il = morphPositions.length; i < il; i++) {

          if (geometry.attributes.position === morphPositions[i]) continue;

          morphPositions[i] = cloneBufferAttribute(morphPositions[i]);

        }

        for (var i = 0, il = morphNormals.length; i < il; i++) {

          if (geometry.attributes.normal === morphNormals[i]) continue;

          morphNormals[i] = cloneBufferAttribute(morphNormals[i]);

        }

        for (var i = 0, il = targets.length; i < il; i++) {

          var target = targets[i];
          var attributeName = 'morphTarget' + i;

          if (hasMorphPosition) {

            // Three.js morph position is absolute value. The formula is
            //   basePosition
            //     + weight0 * ( morphPosition0 - basePosition )
            //     + weight1 * ( morphPosition1 - basePosition )
            //     ...
            // while the glTF one is relative
            //   basePosition
            //     + weight0 * glTFmorphPosition0
            //     + weight1 * glTFmorphPosition1
            //     ...
            // then we need to convert from relative to absolute here.

            if (target.POSITION !== undefined) {

              var positionAttribute = morphPositions[i];
              positionAttribute.name = attributeName;

              var position = geometry.attributes.position;

              for (var j = 0, jl = positionAttribute.count; j < jl; j++) {

                positionAttribute.setXYZ(
                  j,
                  positionAttribute.getX(j) + position.getX(j),
                  positionAttribute.getY(j) + position.getY(j),
                  positionAttribute.getZ(j) + position.getZ(j)
                );

              }

            }

          }

          if (hasMorphNormal) {

            // see target.POSITION's comment

            if (target.NORMAL !== undefined) {

              var normalAttribute = morphNormals[i];
              normalAttribute.name = attributeName;

              var normal = geometry.attributes.normal;

              for (var j = 0, jl = normalAttribute.count; j < jl; j++) {

                normalAttribute.setXYZ(
                  j,
                  normalAttribute.getX(j) + normal.getX(j),
                  normalAttribute.getY(j) + normal.getY(j),
                  normalAttribute.getZ(j) + normal.getZ(j)
                );

              }

            }

          }

        }

        if (hasMorphPosition) geometry.morphAttributes.position = morphPositions;
        if (hasMorphNormal) geometry.morphAttributes.normal = morphNormals;

        return geometry;

      });

    }

    /**
     * @param {THREE.Mesh} mesh
     * @param {GLTF.Mesh} meshDef
     */
    function updateMorphTargets(mesh, meshDef) {

      mesh.updateMorphTargets();

      if (meshDef.weights !== undefined) {

        for (var i = 0, il = meshDef.weights.length; i < il; i++) {

          mesh.morphTargetInfluences[i] = meshDef.weights[i];

        }

      }

      // .extras has user-defined data, so check that .extras.targetNames is an array.
      if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {

        var targetNames = meshDef.extras.targetNames;

        if (mesh.morphTargetInfluences.length === targetNames.length) {

          mesh.morphTargetDictionary = {};

          for (var i = 0, il = targetNames.length; i < il; i++) {

            mesh.morphTargetDictionary[targetNames[i]] = i;

          }

        } else {

          console.warn('THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.');

        }

      }

    }

    function createPrimitiveKey(primitiveDef) {

      var dracoExtension = primitiveDef.extensions && primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION];
      var geometryKey;

      if (dracoExtension) {

        geometryKey = 'draco:' + dracoExtension.bufferView
          + ':' + dracoExtension.indices
          + ':' + createAttributesKey(dracoExtension.attributes);

      } else {

        geometryKey = primitiveDef.indices + ':' + createAttributesKey(primitiveDef.attributes) + ':' + primitiveDef.mode;

      }

      return geometryKey;

    }

    function createAttributesKey(attributes) {

      var attributesKey = '';

      var keys = Object.keys(attributes).sort();

      for (var i = 0, il = keys.length; i < il; i++) {

        attributesKey += keys[i] + ':' + attributes[keys[i]] + ';';

      }

      return attributesKey;

    }

    function cloneBufferAttribute(attribute) {

      if (attribute.isInterleavedBufferAttribute) {

        var count = attribute.count;
        var itemSize = attribute.itemSize;
        var array = attribute.array.slice(0, count * itemSize);

        for (var i = 0, j = 0; i < count; ++i) {

          array[j++] = attribute.getX(i);
          if (itemSize >= 2) array[j++] = attribute.getY(i);
          if (itemSize >= 3) array[j++] = attribute.getZ(i);
          if (itemSize >= 4) array[j++] = attribute.getW(i);

        }

        return new THREE.BufferAttribute(array, itemSize, attribute.normalized);

      }

      return attribute.clone();

    }

    /* GLTF PARSER */

    function GLTFParser(json, extensions, options) {

      this.json = json || {};
      this.extensions = extensions || {};
      this.options = options || {};

      // loader object cache
      this.cache = new GLTFRegistry();

      // BufferGeometry caching
      this.primitiveCache = {};

      this.textureLoader = new THREE.TextureLoader(this.options.manager);
      this.textureLoader.setCrossOrigin(this.options.crossOrigin);

      this.fileLoader = new THREE.FileLoader(this.options.manager);
      this.fileLoader.setResponseType('arraybuffer');

      if (this.options.crossOrigin === 'use-credentials') {

        this.fileLoader.setWithCredentials(true);

      }

    }

    GLTFParser.prototype.parse = function (onLoad, onError) {

      var parser = this;
      var json = this.json;
      var extensions = this.extensions;

      // Clear the loader cache
      this.cache.removeAll();

      // Mark the special nodes/meshes in json for efficient parse
      this.markDefs();

      Promise.all([

        this.getDependencies('scene'),
        this.getDependencies('animation'),
        this.getDependencies('camera'),

      ]).then(function (dependencies) {

        var result = {
          scene: dependencies[0][json.scene || 0],
          scenes: dependencies[0],
          animations: dependencies[1],
          cameras: dependencies[2],
          asset: json.asset,
          parser: parser,
          userData: {}
        };

        addUnknownExtensionsToUserData(extensions, result, json);

        assignExtrasToUserData(result, json);

        onLoad(result);

      }).catch(onError);

    };

    /**
     * Marks the special nodes/meshes in json for efficient parse.
     */
    GLTFParser.prototype.markDefs = function () {

      var nodeDefs = this.json.nodes || [];
      var skinDefs = this.json.skins || [];
      var meshDefs = this.json.meshes || [];

      var meshReferences = {};
      var meshUses = {};

      // Nothing in the node definition indicates whether it is a Bone or an
      // Object3D. Use the skins' joint references to mark bones.
      for (var skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex++) {

        var joints = skinDefs[skinIndex].joints;

        for (var i = 0, il = joints.length; i < il; i++) {

          nodeDefs[joints[i]].isBone = true;

        }

      }

      // Meshes can (and should) be reused by multiple nodes in a glTF asset. To
      // avoid having more than one THREE.Mesh with the same name, count
      // references and rename instances below.
      //
      // Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
      for (var nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {

        var nodeDef = nodeDefs[nodeIndex];

        if (nodeDef.mesh !== undefined) {

          if (meshReferences[nodeDef.mesh] === undefined) {

            meshReferences[nodeDef.mesh] = meshUses[nodeDef.mesh] = 0;

          }

          meshReferences[nodeDef.mesh]++;

          // Nothing in the mesh definition indicates whether it is
          // a SkinnedMesh or Mesh. Use the node's mesh reference
          // to mark SkinnedMesh if node has skin.
          if (nodeDef.skin !== undefined) {

            meshDefs[nodeDef.mesh].isSkinnedMesh = true;

          }

        }

      }

      this.json.meshReferences = meshReferences;
      this.json.meshUses = meshUses;

    };

    /**
     * Requests the specified dependency asynchronously, with caching.
     * @param {string} type
     * @param {number} index
     * @return {Promise<THREE.Object3D|THREE.Material|THREE.Texture|THREE.AnimationClip|ArrayBuffer|Object>}
     */
    GLTFParser.prototype.getDependency = function (type, index) {

      var cacheKey = type + ':' + index;
      var dependency = this.cache.get(cacheKey);

      if (!dependency) {

        switch (type) {

          case 'scene':
            dependency = this.loadScene(index);
            break;

          case 'node':
            dependency = this.loadNode(index);
            break;

          case 'mesh':
            dependency = this.loadMesh(index);
            break;

          case 'accessor':
            dependency = this.loadAccessor(index);
            break;

          case 'bufferView':
            dependency = this.loadBufferView(index);
            break;

          case 'buffer':
            dependency = this.loadBuffer(index);
            break;

          case 'material':
            dependency = this.loadMaterial(index);
            break;

          case 'texture':
            dependency = this.loadTexture(index);
            break;

          case 'skin':
            dependency = this.loadSkin(index);
            break;

          case 'animation':
            dependency = this.loadAnimation(index);
            break;

          case 'camera':
            dependency = this.loadCamera(index);
            break;

          case 'light':
            dependency = this.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL].loadLight(index);
            break;

          default:
            throw new Error('Unknown type: ' + type);

        }

        this.cache.add(cacheKey, dependency);

      }

      return dependency;

    };

    /**
     * Requests all dependencies of the specified type asynchronously, with caching.
     * @param {string} type
     * @return {Promise<Array<Object>>}
     */
    GLTFParser.prototype.getDependencies = function (type) {

      var dependencies = this.cache.get(type);

      if (!dependencies) {

        var parser = this;
        var defs = this.json[type + (type === 'mesh' ? 'es' : 's')] || [];

        dependencies = Promise.all(defs.map(function (def, index) {

          return parser.getDependency(type, index);

        }));

        this.cache.add(type, dependencies);

      }

      return dependencies;

    };

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
     * @param {number} bufferIndex
     * @return {Promise<ArrayBuffer>}
     */
    GLTFParser.prototype.loadBuffer = function (bufferIndex) {

      var bufferDef = this.json.buffers[bufferIndex];
      var loader = this.fileLoader;

      if (bufferDef.type && bufferDef.type !== 'arraybuffer') {

        throw new Error('THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.');

      }

      // If present, GLB container is required to be the first buffer.
      if (bufferDef.uri === undefined && bufferIndex === 0) {

        return Promise.resolve(this.extensions[EXTENSIONS.KHR_BINARY_GLTF].body);

      }

      var options = this.options;

      return new Promise(function (resolve, reject) {

        loader.load(resolveURL(bufferDef.uri, options.path), resolve, undefined, function () {

          reject(new Error('THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".'));

        });

      });

    };

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
     * @param {number} bufferViewIndex
     * @return {Promise<ArrayBuffer>}
     */
    GLTFParser.prototype.loadBufferView = function (bufferViewIndex) {

      var bufferViewDef = this.json.bufferViews[bufferViewIndex];

      return this.getDependency('buffer', bufferViewDef.buffer).then(function (buffer) {

        var byteLength = bufferViewDef.byteLength || 0;
        var byteOffset = bufferViewDef.byteOffset || 0;
        return buffer.slice(byteOffset, byteOffset + byteLength);

      });

    };

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
     * @param {number} accessorIndex
     * @return {Promise<THREE.BufferAttribute|THREE.InterleavedBufferAttribute>}
     */
    GLTFParser.prototype.loadAccessor = function (accessorIndex) {

      var parser = this;
      var json = this.json;

      var accessorDef = this.json.accessors[accessorIndex];

      if (accessorDef.bufferView === undefined && accessorDef.sparse === undefined) {

        // Ignore empty accessors, which may be used to declare runtime
        // information about attributes coming from another source (e.g. Draco
        // compression extension).
        return Promise.resolve(null);

      }

      var pendingBufferViews = [];

      if (accessorDef.bufferView !== undefined) {

        pendingBufferViews.push(this.getDependency('bufferView', accessorDef.bufferView));

      } else {

        pendingBufferViews.push(null);

      }

      if (accessorDef.sparse !== undefined) {

        pendingBufferViews.push(this.getDependency('bufferView', accessorDef.sparse.indices.bufferView));
        pendingBufferViews.push(this.getDependency('bufferView', accessorDef.sparse.values.bufferView));

      }

      return Promise.all(pendingBufferViews).then(function (bufferViews) {

        var bufferView = bufferViews[0];

        var itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
        var TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];

        // For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
        var elementBytes = TypedArray.BYTES_PER_ELEMENT;
        var itemBytes = elementBytes * itemSize;
        var byteOffset = accessorDef.byteOffset || 0;
        var byteStride = accessorDef.bufferView !== undefined ? json.bufferViews[accessorDef.bufferView].byteStride : undefined;
        var normalized = accessorDef.normalized === true;
        var array, bufferAttribute;

        // The buffer is not interleaved if the stride is the item size in bytes.
        if (byteStride && byteStride !== itemBytes) {

          // Each "slice" of the buffer, as defined by 'count' elements of 'byteStride' bytes, gets its own InterleavedBuffer
          // This makes sure that IBA.count reflects accessor.count properly
          var ibSlice = Math.floor(byteOffset / byteStride);
          var ibCacheKey = 'InterleavedBuffer:' + accessorDef.bufferView + ':' + accessorDef.componentType + ':' + ibSlice + ':' + accessorDef.count;
          var ib = parser.cache.get(ibCacheKey);

          if (!ib) {

            array = new TypedArray(bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes);

            // Integer parameters to IB/IBA are in array elements, not bytes.
            ib = new THREE.InterleavedBuffer(array, byteStride / elementBytes);

            parser.cache.add(ibCacheKey, ib);

          }

          bufferAttribute = new THREE.InterleavedBufferAttribute(ib, itemSize, (byteOffset % byteStride) / elementBytes, normalized);

        } else {

          if (bufferView === null) {

            array = new TypedArray(accessorDef.count * itemSize);

          } else {

            array = new TypedArray(bufferView, byteOffset, accessorDef.count * itemSize);

          }

          bufferAttribute = new THREE.BufferAttribute(array, itemSize, normalized);

        }

        // https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#sparse-accessors
        if (accessorDef.sparse !== undefined) {

          var itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
          var TypedArrayIndices = WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType];

          var byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
          var byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;

          var sparseIndices = new TypedArrayIndices(bufferViews[1], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices);
          var sparseValues = new TypedArray(bufferViews[2], byteOffsetValues, accessorDef.sparse.count * itemSize);

          if (bufferView !== null) {

            // Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
            bufferAttribute = new THREE.BufferAttribute(bufferAttribute.array.slice(), bufferAttribute.itemSize, bufferAttribute.normalized);

          }

          for (var i = 0, il = sparseIndices.length; i < il; i++) {

            var index = sparseIndices[i];

            bufferAttribute.setX(index, sparseValues[i * itemSize]);
            if (itemSize >= 2) bufferAttribute.setY(index, sparseValues[i * itemSize + 1]);
            if (itemSize >= 3) bufferAttribute.setZ(index, sparseValues[i * itemSize + 2]);
            if (itemSize >= 4) bufferAttribute.setW(index, sparseValues[i * itemSize + 3]);
            if (itemSize >= 5) throw new Error('THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.');

          }

        }

        return bufferAttribute;

      });

    };

    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
     * @param {number} textureIndex
     * @return {Promise<THREE.Texture>}
     */
    GLTFParser.prototype.loadTexture = function (textureIndex) {

      var parser = this;
      var json = this.json;
      var options = this.options;
      var textureLoader = this.textureLoader;

      var URL = window.URL || window.webkitURL;

      var textureDef = json.textures[textureIndex];

      var textureExtensions = textureDef.extensions || {};

      var source;

      if (textureExtensions[EXTENSIONS.MSFT_TEXTURE_DDS]) {

        source = json.images[textureExtensions[EXTENSIONS.MSFT_TEXTURE_DDS].source];

      } else {

        source = json.images[textureDef.source];

      }

      var sourceURI = source.uri;
      var isObjectURL = false;

      if (source.bufferView !== undefined) {

        // Load binary image data from bufferView, if provided.

        sourceURI = parser.getDependency('bufferView', source.bufferView).then(function (bufferView) {

          isObjectURL = true;
          var blob = new Blob([bufferView], { type: source.mimeType });
          sourceURI = URL.createObjectURL(blob);
          return sourceURI;

        });

      }

      return Promise.resolve(sourceURI).then(function (sourceURI) {

        // Load Texture resource.

        var loader = options.manager.getHandler(sourceURI);

        if (!loader) {

          loader = textureExtensions[EXTENSIONS.MSFT_TEXTURE_DDS]
            ? parser.extensions[EXTENSIONS.MSFT_TEXTURE_DDS].ddsLoader
            : textureLoader;

        }

        return new Promise(function (resolve, reject) {

          loader.load(resolveURL(sourceURI, options.path), resolve, undefined, reject);

        });

      }).then(function (texture) {

        // Clean up resources and configure Texture.

        if (isObjectURL === true) {

          URL.revokeObjectURL(sourceURI);

        }

        texture.flipY = false;

        if (textureDef.name !== undefined) texture.name = textureDef.name;

        // Ignore unknown mime types, like DDS files.
        if (source.mimeType in MIME_TYPE_FORMATS) {

          texture.format = MIME_TYPE_FORMATS[source.mimeType];

        }

        var samplers = json.samplers || {};
        var sampler = samplers[textureDef.sampler] || {};

        texture.magFilter = WEBGL_FILTERS[sampler.magFilter] || THREE.LinearFilter;
        texture.minFilter = WEBGL_FILTERS[sampler.minFilter] || THREE.LinearMipmapLinearFilter;
        texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS] || THREE.RepeatWrapping;
        texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT] || THREE.RepeatWrapping;

        return texture;

      });

    };

    /**
     * Asynchronously assigns a texture to the given material parameters.
     * @param {Object} materialParams
     * @param {string} mapName
     * @param {Object} mapDef
     * @return {Promise}
     */
    GLTFParser.prototype.assignTexture = function (materialParams, mapName, mapDef) {

      var parser = this;

      return this.getDependency('texture', mapDef.index).then(function (texture) {

        if (!texture.isCompressedTexture) {

          switch (mapName) {

            case 'aoMap':
            case 'emissiveMap':
            case 'metalnessMap':
            case 'normalMap':
            case 'roughnessMap':
              texture.format = THREE.RGBFormat;
              break;

          }

        }

        if (parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {

          var transform = mapDef.extensions !== undefined ? mapDef.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] : undefined;

          if (transform) {

            texture = parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM].extendTexture(texture, transform);

          }

        }

        materialParams[mapName] = texture;

      });

    };

    /**
     * Assigns final material to a Mesh, Line, or Points instance. The instance
     * already has a material (generated from the glTF material options alone)
     * but reuse of the same glTF material may require multiple threejs materials
     * to accomodate different primitive types, defines, etc. New materials will
     * be created if necessary, and reused from a cache.
     * @param  {THREE.Object3D} mesh Mesh, Line, or Points instance.
     */
    GLTFParser.prototype.assignFinalMaterial = function (mesh) {

      var geometry = mesh.geometry;
      var material = mesh.material;
      var extensions = this.extensions;

      var useVertexTangents = geometry.attributes.tangent !== undefined;
      var useVertexColors = geometry.attributes.color !== undefined;
      var useFlatShading = geometry.attributes.normal === undefined;
      var useSkinning = mesh.isSkinnedMesh === true;
      var useMorphTargets = Object.keys(geometry.morphAttributes).length > 0;
      var useMorphNormals = useMorphTargets && geometry.morphAttributes.normal !== undefined;

      if (mesh.isPoints) {

        var cacheKey = 'PointsMaterial:' + material.uuid;

        var pointsMaterial = this.cache.get(cacheKey);

        if (!pointsMaterial) {

          pointsMaterial = new THREE.PointsMaterial();
          THREE.Material.prototype.copy.call(pointsMaterial, material);
          pointsMaterial.color.copy(material.color);
          pointsMaterial.map = material.map;
          pointsMaterial.sizeAttenuation = false; // glTF spec says points should be 1px

          this.cache.add(cacheKey, pointsMaterial);

        }

        material = pointsMaterial;

      } else if (mesh.isLine) {

        var cacheKey = 'LineBasicMaterial:' + material.uuid;

        var lineMaterial = this.cache.get(cacheKey);

        if (!lineMaterial) {

          lineMaterial = new THREE.LineBasicMaterial();
          THREE.Material.prototype.copy.call(lineMaterial, material);
          lineMaterial.color.copy(material.color);

          this.cache.add(cacheKey, lineMaterial);

        }

        material = lineMaterial;

      }

      // Clone the material if it will be modified
      if (useVertexTangents || useVertexColors || useFlatShading || useSkinning || useMorphTargets) {

        var cacheKey = 'ClonedMaterial:' + material.uuid + ':';

        if (material.isGLTFSpecularGlossinessMaterial) cacheKey += 'specular-glossiness:';
        if (useSkinning) cacheKey += 'skinning:';
        if (useVertexTangents) cacheKey += 'vertex-tangents:';
        if (useVertexColors) cacheKey += 'vertex-colors:';
        if (useFlatShading) cacheKey += 'flat-shading:';
        if (useMorphTargets) cacheKey += 'morph-targets:';
        if (useMorphNormals) cacheKey += 'morph-normals:';

        var cachedMaterial = this.cache.get(cacheKey);

        if (!cachedMaterial) {

          cachedMaterial = material.isGLTFSpecularGlossinessMaterial
            ? extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].cloneMaterial(material)
            : material.clone();

          if (useSkinning) cachedMaterial.skinning = true;
          if (useVertexTangents) cachedMaterial.vertexTangents = true;
          if (useVertexColors) cachedMaterial.vertexColors = THREE.VertexColors;
          if (useFlatShading) cachedMaterial.flatShading = true;
          if (useMorphTargets) cachedMaterial.morphTargets = true;
          if (useMorphNormals) cachedMaterial.morphNormals = true;

          this.cache.add(cacheKey, cachedMaterial);

        }

        material = cachedMaterial;

      }

      // workarounds for mesh and geometry

      if (material.aoMap && geometry.attributes.uv2 === undefined && geometry.attributes.uv !== undefined) {

        // console.log('THREE.GLTFLoader: Duplicating UVs to support aoMap.');
        geometry.addAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));

      }

      if (material.isGLTFSpecularGlossinessMaterial) {

        // for GLTFSpecularGlossinessMaterial(ShaderMaterial) uniforms runtime update
        mesh.onBeforeRender = extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].refreshUniforms;

      }

      mesh.material = material;

    };

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
     * @param {number} materialIndex
     * @return {Promise<THREE.Material>}
     */
    GLTFParser.prototype.loadMaterial = function (materialIndex) {

      var parser = this;
      var json = this.json;
      var extensions = this.extensions;
      var materialDef = json.materials[materialIndex];

      var materialType;
      var materialParams = {};
      var materialExtensions = materialDef.extensions || {};

      var pending = [];

      if (materialExtensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS]) {

        var sgExtension = extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS];
        materialType = sgExtension.getMaterialType();
        pending.push(sgExtension.extendParams(materialParams, materialDef, parser));

      } else if (materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {

        var kmuExtension = extensions[EXTENSIONS.KHR_MATERIALS_UNLIT];
        materialType = kmuExtension.getMaterialType();
        pending.push(kmuExtension.extendParams(materialParams, materialDef, parser));

      } else {

        // Specification:
        // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material

        materialType = THREE.MeshStandardMaterial;

        var metallicRoughness = materialDef.pbrMetallicRoughness || {};

        materialParams.color = new THREE.Color(1.0, 1.0, 1.0);
        materialParams.opacity = 1.0;

        if (Array.isArray(metallicRoughness.baseColorFactor)) {

          var array = metallicRoughness.baseColorFactor;

          materialParams.color.fromArray(array);
          materialParams.opacity = array[3];

        }

        if (metallicRoughness.baseColorTexture !== undefined) {

          pending.push(parser.assignTexture(materialParams, 'map', metallicRoughness.baseColorTexture));

        }

        materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1.0;
        materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1.0;

        if (metallicRoughness.metallicRoughnessTexture !== undefined) {

          pending.push(parser.assignTexture(materialParams, 'metalnessMap', metallicRoughness.metallicRoughnessTexture));
          pending.push(parser.assignTexture(materialParams, 'roughnessMap', metallicRoughness.metallicRoughnessTexture));

        }

      }

      if (materialDef.doubleSided === true) {

        materialParams.side = THREE.DoubleSide;

      }

      var alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;

      if (alphaMode === ALPHA_MODES.BLEND) {

        materialParams.transparent = true;

      } else {

        materialParams.transparent = false;

        if (alphaMode === ALPHA_MODES.MASK) {

          materialParams.alphaTest = materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5;

        }

      }

      if (materialDef.normalTexture !== undefined && materialType !== THREE.MeshBasicMaterial) {

        pending.push(parser.assignTexture(materialParams, 'normalMap', materialDef.normalTexture));

        materialParams.normalScale = new THREE.Vector2(1, 1);

        if (materialDef.normalTexture.scale !== undefined) {

          materialParams.normalScale.set(materialDef.normalTexture.scale, materialDef.normalTexture.scale);

        }

      }

      if (materialDef.occlusionTexture !== undefined && materialType !== THREE.MeshBasicMaterial) {

        pending.push(parser.assignTexture(materialParams, 'aoMap', materialDef.occlusionTexture));

        if (materialDef.occlusionTexture.strength !== undefined) {

          materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;

        }

      }

      if (materialDef.emissiveFactor !== undefined && materialType !== THREE.MeshBasicMaterial) {

        materialParams.emissive = new THREE.Color().fromArray(materialDef.emissiveFactor);

      }

      if (materialDef.emissiveTexture !== undefined && materialType !== THREE.MeshBasicMaterial) {

        pending.push(parser.assignTexture(materialParams, 'emissiveMap', materialDef.emissiveTexture));

      }

      return Promise.all(pending).then(function () {

        var material;

        if (materialType === THREE.ShaderMaterial) {

          material = extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].createMaterial(materialParams);

        } else {

          material = new materialType(materialParams);

        }

        if (materialDef.name !== undefined) material.name = materialDef.name;

        // baseColorTexture, emissiveTexture, and specularGlossinessTexture use sRGB encoding.
        if (material.map) material.map.encoding = THREE.sRGBEncoding;
        if (material.emissiveMap) material.emissiveMap.encoding = THREE.sRGBEncoding;
        if (material.specularMap) material.specularMap.encoding = THREE.sRGBEncoding;

        assignExtrasToUserData(material, materialDef);

        if (materialDef.extensions) addUnknownExtensionsToUserData(extensions, material, materialDef);

        return material;

      });

    };

    /**
     * @param {THREE.BufferGeometry} geometry
     * @param {GLTF.Primitive} primitiveDef
     * @param {GLTFParser} parser
     * @return {Promise<THREE.BufferGeometry>}
     */
    function addPrimitiveAttributes(geometry, primitiveDef, parser) {

      var attributes = primitiveDef.attributes;

      var pending = [];

      function assignAttributeAccessor(accessorIndex, attributeName) {

        return parser.getDependency('accessor', accessorIndex)
          .then(function (accessor) {

            geometry.addAttribute(attributeName, accessor);

          });

      }

      for (var gltfAttributeName in attributes) {

        var threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase();

        // Skip attributes already provided by e.g. Draco extension.
        if (threeAttributeName in geometry.attributes) continue;

        pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName));

      }

      if (primitiveDef.indices !== undefined && !geometry.index) {

        var accessor = parser.getDependency('accessor', primitiveDef.indices).then(function (accessor) {

          geometry.setIndex(accessor);

        });

        pending.push(accessor);

      }

      assignExtrasToUserData(geometry, primitiveDef);

      return Promise.all(pending).then(function () {

        return primitiveDef.targets !== undefined
          ? addMorphTargets(geometry, primitiveDef.targets, parser)
          : geometry;

      });

    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
     *
     * Creates BufferGeometries from primitives.
     *
     * @param {Array<GLTF.Primitive>} primitives
     * @return {Promise<Array<THREE.BufferGeometry>>}
     */
    GLTFParser.prototype.loadGeometries = function (primitives) {

      var parser = this;
      var extensions = this.extensions;
      var cache = this.primitiveCache;

      function createDracoPrimitive(primitive) {

        return extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]
          .decodePrimitive(primitive, parser)
          .then(function (geometry) {

            return addPrimitiveAttributes(geometry, primitive, parser);

          });

      }

      var pending = [];

      for (var i = 0, il = primitives.length; i < il; i++) {

        var primitive = primitives[i];
        var cacheKey = createPrimitiveKey(primitive);

        // See if we've already created this geometry
        var cached = cache[cacheKey];

        if (cached) {

          // Use the cached geometry if it exists
          pending.push(cached.promise);

        } else {

          var geometryPromise;

          if (primitive.extensions && primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]) {

            // Use DRACO geometry if available
            geometryPromise = createDracoPrimitive(primitive);

          } else {

            // Otherwise create a new geometry
            geometryPromise = addPrimitiveAttributes(new THREE.BufferGeometry(), primitive, parser);

          }

          // Cache this geometry
          cache[cacheKey] = { primitive: primitive, promise: geometryPromise };

          pending.push(geometryPromise);

        }

      }

      return Promise.all(pending);

    };

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
     * @param {number} meshIndex
     * @return {Promise<THREE.Group|THREE.Mesh|THREE.SkinnedMesh>}
     */
    GLTFParser.prototype.loadMesh = function (meshIndex) {

      var parser = this;
      var json = this.json;

      var meshDef = json.meshes[meshIndex];
      var primitives = meshDef.primitives;

      var pending = [];

      for (var i = 0, il = primitives.length; i < il; i++) {

        var material = primitives[i].material === undefined
          ? createDefaultMaterial()
          : this.getDependency('material', primitives[i].material);

        pending.push(material);

      }

      return Promise.all(pending).then(function (originalMaterials) {

        return parser.loadGeometries(primitives).then(function (geometries) {

          var meshes = [];

          for (var i = 0, il = geometries.length; i < il; i++) {

            var geometry = geometries[i];
            var primitive = primitives[i];

            // 1. create Mesh

            var mesh;

            var material = originalMaterials[i];

            if (primitive.mode === WEBGL_CONSTANTS.TRIANGLES ||
              primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ||
              primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ||
              primitive.mode === undefined) {

              // .isSkinnedMesh isn't in glTF spec. See .markDefs()
              mesh = meshDef.isSkinnedMesh === true
                ? new THREE.SkinnedMesh(geometry, material)
                : new THREE.Mesh(geometry, material);

              if (mesh.isSkinnedMesh === true && !mesh.geometry.attributes.skinWeight.normalized) {

                // we normalize floating point skin weight array to fix malformed assets (see #15319)
                // it's important to skip this for non-float32 data since normalizeSkinWeights assumes non-normalized inputs
                mesh.normalizeSkinWeights();

              }

              if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) {

                mesh.drawMode = THREE.TriangleStripDrawMode;

              } else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) {

                mesh.drawMode = THREE.TriangleFanDrawMode;

              }

            } else if (primitive.mode === WEBGL_CONSTANTS.LINES) {

              mesh = new THREE.LineSegments(geometry, material);

            } else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) {

              mesh = new THREE.Line(geometry, material);

            } else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) {

              mesh = new THREE.LineLoop(geometry, material);

            } else if (primitive.mode === WEBGL_CONSTANTS.POINTS) {

              mesh = new THREE.Points(geometry, material);

            } else {

              throw new Error('THREE.GLTFLoader: Primitive mode unsupported: ' + primitive.mode);

            }

            if (Object.keys(mesh.geometry.morphAttributes).length > 0) {

              updateMorphTargets(mesh, meshDef);

            }

            mesh.name = meshDef.name || ('mesh_' + meshIndex);

            if (geometries.length > 1) mesh.name += '_' + i;

            assignExtrasToUserData(mesh, meshDef);

            parser.assignFinalMaterial(mesh);

            meshes.push(mesh);

          }

          if (meshes.length === 1) {

            return meshes[0];

          }

          var group = new THREE.Group();

          for (var i = 0, il = meshes.length; i < il; i++) {

            group.add(meshes[i]);

          }

          return group;

        });

      });

    };

    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
     * @param {number} cameraIndex
     * @return {Promise<THREE.Camera>}
     */
    GLTFParser.prototype.loadCamera = function (cameraIndex) {

      var camera;
      var cameraDef = this.json.cameras[cameraIndex];
      var params = cameraDef[cameraDef.type];

      if (!params) {

        console.warn('THREE.GLTFLoader: Missing camera parameters.');
        return;

      }

      if (cameraDef.type === 'perspective') {

        camera = new THREE.PerspectiveCamera(THREE.Math.radToDeg(params.yfov), params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6);

      } else if (cameraDef.type === 'orthographic') {

        camera = new THREE.OrthographicCamera(params.xmag / - 2, params.xmag / 2, params.ymag / 2, params.ymag / - 2, params.znear, params.zfar);

      }

      if (cameraDef.name !== undefined) camera.name = cameraDef.name;

      assignExtrasToUserData(camera, cameraDef);

      return Promise.resolve(camera);

    };

    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
     * @param {number} skinIndex
     * @return {Promise<Object>}
     */
    GLTFParser.prototype.loadSkin = function (skinIndex) {

      var skinDef = this.json.skins[skinIndex];

      var skinEntry = { joints: skinDef.joints };

      if (skinDef.inverseBindMatrices === undefined) {

        return Promise.resolve(skinEntry);

      }

      return this.getDependency('accessor', skinDef.inverseBindMatrices).then(function (accessor) {

        skinEntry.inverseBindMatrices = accessor;

        return skinEntry;

      });

    };

    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
     * @param {number} animationIndex
     * @return {Promise<THREE.AnimationClip>}
     */
    GLTFParser.prototype.loadAnimation = function (animationIndex) {

      var json = this.json;

      var animationDef = json.animations[animationIndex];

      var pendingNodes = [];
      var pendingInputAccessors = [];
      var pendingOutputAccessors = [];
      var pendingSamplers = [];
      var pendingTargets = [];

      for (var i = 0, il = animationDef.channels.length; i < il; i++) {

        var channel = animationDef.channels[i];
        var sampler = animationDef.samplers[channel.sampler];
        var target = channel.target;
        var name = target.node !== undefined ? target.node : target.id; // NOTE: target.id is deprecated.
        var input = animationDef.parameters !== undefined ? animationDef.parameters[sampler.input] : sampler.input;
        var output = animationDef.parameters !== undefined ? animationDef.parameters[sampler.output] : sampler.output;

        pendingNodes.push(this.getDependency('node', name));
        pendingInputAccessors.push(this.getDependency('accessor', input));
        pendingOutputAccessors.push(this.getDependency('accessor', output));
        pendingSamplers.push(sampler);
        pendingTargets.push(target);

      }

      return Promise.all([

        Promise.all(pendingNodes),
        Promise.all(pendingInputAccessors),
        Promise.all(pendingOutputAccessors),
        Promise.all(pendingSamplers),
        Promise.all(pendingTargets)

      ]).then(function (dependencies) {

        var nodes = dependencies[0];
        var inputAccessors = dependencies[1];
        var outputAccessors = dependencies[2];
        var samplers = dependencies[3];
        var targets = dependencies[4];

        var tracks = [];

        for (var i = 0, il = nodes.length; i < il; i++) {

          var node = nodes[i];
          var inputAccessor = inputAccessors[i];
          var outputAccessor = outputAccessors[i];
          var sampler = samplers[i];
          var target = targets[i];

          if (node === undefined) continue;

          node.updateMatrix();
          node.matrixAutoUpdate = true;

          var TypedKeyframeTrack;

          switch (PATH_PROPERTIES[target.path]) {

            case PATH_PROPERTIES.weights:

              TypedKeyframeTrack = THREE.NumberKeyframeTrack;
              break;

            case PATH_PROPERTIES.rotation:

              TypedKeyframeTrack = THREE.QuaternionKeyframeTrack;
              break;

            case PATH_PROPERTIES.position:
            case PATH_PROPERTIES.scale:
            default:

              TypedKeyframeTrack = THREE.VectorKeyframeTrack;
              break;

          }

          var targetName = node.name ? node.name : node.uuid;

          var interpolation = sampler.interpolation !== undefined ? INTERPOLATION[sampler.interpolation] : THREE.InterpolateLinear;

          var targetNames = [];

          if (PATH_PROPERTIES[target.path] === PATH_PROPERTIES.weights) {

            // Node may be a THREE.Group (glTF mesh with several primitives) or a THREE.Mesh.
            node.traverse(function (object) {

              if (object.isMesh === true && object.morphTargetInfluences) {

                targetNames.push(object.name ? object.name : object.uuid);

              }

            });

          } else {

            targetNames.push(targetName);

          }

          var outputArray = outputAccessor.array;

          if (outputAccessor.normalized) {

            var scale;

            if (outputArray.constructor === Int8Array) {

              scale = 1 / 127;

            } else if (outputArray.constructor === Uint8Array) {

              scale = 1 / 255;

            } else if (outputArray.constructor == Int16Array) {

              scale = 1 / 32767;

            } else if (outputArray.constructor === Uint16Array) {

              scale = 1 / 65535;

            } else {

              throw new Error('THREE.GLTFLoader: Unsupported output accessor component type.');

            }

            var scaled = new Float32Array(outputArray.length);

            for (var j = 0, jl = outputArray.length; j < jl; j++) {

              scaled[j] = outputArray[j] * scale;

            }

            outputArray = scaled;

          }

          for (var j = 0, jl = targetNames.length; j < jl; j++) {

            var track = new TypedKeyframeTrack(
              targetNames[j] + '.' + PATH_PROPERTIES[target.path],
              inputAccessor.array,
              outputArray,
              interpolation
            );

            // Override interpolation with custom factory method.
            if (sampler.interpolation === 'CUBICSPLINE') {

              track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline(result) {

                // A CUBICSPLINE keyframe in glTF has three output values for each input value,
                // representing inTangent, splineVertex, and outTangent. As a result, track.getValueSize()
                // must be divided by three to get the interpolant's sampleSize argument.

                return new GLTFCubicSplineInterpolant(this.times, this.values, this.getValueSize() / 3, result);

              };

              // Mark as CUBICSPLINE. `track.getInterpolation()` doesn't support custom interpolants.
              track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;

            }

            tracks.push(track);

          }

        }

        var name = animationDef.name !== undefined ? animationDef.name : 'animation_' + animationIndex;

        return new THREE.AnimationClip(name, undefined, tracks);

      });

    };

    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
     * @param {number} nodeIndex
     * @return {Promise<THREE.Object3D>}
     */
    GLTFParser.prototype.loadNode = function (nodeIndex) {

      var json = this.json;
      var extensions = this.extensions;
      var parser = this;

      var meshReferences = json.meshReferences;
      var meshUses = json.meshUses;

      var nodeDef = json.nodes[nodeIndex];

      return (function () {

        var pending = [];

        if (nodeDef.mesh !== undefined) {

          pending.push(parser.getDependency('mesh', nodeDef.mesh).then(function (mesh) {

            var node;

            if (meshReferences[nodeDef.mesh] > 1) {

              var instanceNum = meshUses[nodeDef.mesh]++;

              node = mesh.clone();
              node.name += '_instance_' + instanceNum;

              // onBeforeRender copy for Specular-Glossiness
              node.onBeforeRender = mesh.onBeforeRender;

              for (var i = 0, il = node.children.length; i < il; i++) {

                node.children[i].name += '_instance_' + instanceNum;
                node.children[i].onBeforeRender = mesh.children[i].onBeforeRender;

              }

            } else {

              node = mesh;

            }

            // if weights are provided on the node, override weights on the mesh.
            if (nodeDef.weights !== undefined) {

              node.traverse(function (o) {

                if (!o.isMesh) return;

                for (var i = 0, il = nodeDef.weights.length; i < il; i++) {

                  o.morphTargetInfluences[i] = nodeDef.weights[i];

                }

              });

            }

            return node;

          }));

        }

        if (nodeDef.camera !== undefined) {

          pending.push(parser.getDependency('camera', nodeDef.camera));

        }

        if (nodeDef.extensions
          && nodeDef.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL]
          && nodeDef.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL].light !== undefined) {

          pending.push(parser.getDependency('light', nodeDef.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL].light));

        }

        return Promise.all(pending);

      }()).then(function (objects) {

        var node;

        // .isBone isn't in glTF spec. See .markDefs
        if (nodeDef.isBone === true) {

          node = new THREE.Bone();

        } else if (objects.length > 1) {

          node = new THREE.Group();

        } else if (objects.length === 1) {

          node = objects[0];

        } else {

          node = new THREE.Object3D();

        }

        if (node !== objects[0]) {

          for (var i = 0, il = objects.length; i < il; i++) {

            node.add(objects[i]);

          }

        }

        if (nodeDef.name !== undefined) {

          node.userData.name = nodeDef.name;
          node.name = THREE.PropertyBinding.sanitizeNodeName(nodeDef.name);

        }

        assignExtrasToUserData(node, nodeDef);

        if (nodeDef.extensions) addUnknownExtensionsToUserData(extensions, node, nodeDef);

        if (nodeDef.matrix !== undefined) {

          var matrix = new THREE.Matrix4();
          matrix.fromArray(nodeDef.matrix);
          node.applyMatrix(matrix);

        } else {

          if (nodeDef.translation !== undefined) {

            node.position.fromArray(nodeDef.translation);

          }

          if (nodeDef.rotation !== undefined) {

            node.quaternion.fromArray(nodeDef.rotation);

          }

          if (nodeDef.scale !== undefined) {

            node.scale.fromArray(nodeDef.scale);

          }

        }

        return node;

      });

    };

    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
     * @param {number} sceneIndex
     * @return {Promise<THREE.Scene>}
     */
    GLTFParser.prototype.loadScene = function () {

      // scene node hierachy builder

      function buildNodeHierachy(nodeId, parentObject, json, parser) {

        var nodeDef = json.nodes[nodeId];

        return parser.getDependency('node', nodeId).then(function (node) {

          if (nodeDef.skin === undefined) return node;

          // build skeleton here as well

          var skinEntry;

          return parser.getDependency('skin', nodeDef.skin).then(function (skin) {

            skinEntry = skin;

            var pendingJoints = [];

            for (var i = 0, il = skinEntry.joints.length; i < il; i++) {

              pendingJoints.push(parser.getDependency('node', skinEntry.joints[i]));

            }

            return Promise.all(pendingJoints);

          }).then(function (jointNodes) {

            node.traverse(function (mesh) {

              if (!mesh.isMesh) return;

              var bones = [];
              var boneInverses = [];

              for (var j = 0, jl = jointNodes.length; j < jl; j++) {

                var jointNode = jointNodes[j];

                if (jointNode) {

                  bones.push(jointNode);

                  var mat = new THREE.Matrix4();

                  if (skinEntry.inverseBindMatrices !== undefined) {

                    mat.fromArray(skinEntry.inverseBindMatrices.array, j * 16);

                  }

                  boneInverses.push(mat);

                } else {

                  console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', skinEntry.joints[j]);

                }

              }

              mesh.bind(new THREE.Skeleton(bones, boneInverses), mesh.matrixWorld);

            });

            return node;

          });

        }).then(function (node) {

          // build node hierachy

          parentObject.add(node);

          var pending = [];

          if (nodeDef.children) {

            var children = nodeDef.children;

            for (var i = 0, il = children.length; i < il; i++) {

              var child = children[i];
              pending.push(buildNodeHierachy(child, node, json, parser));

            }

          }

          return Promise.all(pending);

        });

      }

      return function loadScene(sceneIndex) {

        var json = this.json;
        var extensions = this.extensions;
        var sceneDef = this.json.scenes[sceneIndex];
        var parser = this;

        var scene = new THREE.Scene();
        if (sceneDef.name !== undefined) scene.name = sceneDef.name;

        assignExtrasToUserData(scene, sceneDef);

        if (sceneDef.extensions) addUnknownExtensionsToUserData(extensions, scene, sceneDef);

        var nodeIds = sceneDef.nodes || [];

        var pending = [];

        for (var i = 0, il = nodeIds.length; i < il; i++) {

          pending.push(buildNodeHierachy(nodeIds[i], scene, json, parser));

        }

        return Promise.all(pending).then(function () {

          return scene;

        });

      };

    }();

    return GLTFLoader;

  })();

  /**
   * @author mrdoob / http://mrdoob.com/
   */

  THREE.OBJLoader = (function () {

    // o object_name | g group_name
    var object_pattern = /^[og]\s*(.+)?/;
    // mtllib file_reference
    var material_library_pattern = /^mtllib /;
    // usemtl material_name
    var material_use_pattern = /^usemtl /;

    function ParserState() {

      var state = {
        objects: [],
        object: {},

        vertices: [],
        normals: [],
        colors: [],
        uvs: [],

        materialLibraries: [],

        startObject: function (name, fromDeclaration) {

          // If the current object (initial from reset) is not from a g/o declaration in the parsed
          // file. We need to use it for the first parsed g/o to keep things in sync.
          if (this.object && this.object.fromDeclaration === false) {

            this.object.name = name;
            this.object.fromDeclaration = (fromDeclaration !== false);
            return;

          }

          var previousMaterial = (this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined);

          if (this.object && typeof this.object._finalize === 'function') {

            this.object._finalize(true);

          }

          this.object = {
            name: name || '',
            fromDeclaration: (fromDeclaration !== false),

            geometry: {
              vertices: [],
              normals: [],
              colors: [],
              uvs: []
            },
            materials: [],
            smooth: true,

            startMaterial: function (name, libraries) {

              var previous = this._finalize(false);

              // New usemtl declaration overwrites an inherited material, except if faces were declared
              // after the material, then it must be preserved for proper MultiMaterial continuation.
              if (previous && (previous.inherited || previous.groupCount <= 0)) {

                this.materials.splice(previous.index, 1);

              }

              var material = {
                index: this.materials.length,
                name: name || '',
                mtllib: (Array.isArray(libraries) && libraries.length > 0 ? libraries[libraries.length - 1] : ''),
                smooth: (previous !== undefined ? previous.smooth : this.smooth),
                groupStart: (previous !== undefined ? previous.groupEnd : 0),
                groupEnd: - 1,
                groupCount: - 1,
                inherited: false,

                clone: function (index) {

                  var cloned = {
                    index: (typeof index === 'number' ? index : this.index),
                    name: this.name,
                    mtllib: this.mtllib,
                    smooth: this.smooth,
                    groupStart: 0,
                    groupEnd: - 1,
                    groupCount: - 1,
                    inherited: false
                  };
                  cloned.clone = this.clone.bind(cloned);
                  return cloned;

                }
              };

              this.materials.push(material);

              return material;

            },

            currentMaterial: function () {

              if (this.materials.length > 0) {

                return this.materials[this.materials.length - 1];

              }

              return undefined;

            },

            _finalize: function (end) {

              var lastMultiMaterial = this.currentMaterial();
              if (lastMultiMaterial && lastMultiMaterial.groupEnd === - 1) {

                lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
                lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
                lastMultiMaterial.inherited = false;

              }

              // Ignore objects tail materials if no face declarations followed them before a new o/g started.
              if (end && this.materials.length > 1) {

                for (var mi = this.materials.length - 1; mi >= 0; mi--) {

                  if (this.materials[mi].groupCount <= 0) {

                    this.materials.splice(mi, 1);

                  }

                }

              }

              // Guarantee at least one empty material, this makes the creation later more straight forward.
              if (end && this.materials.length === 0) {

                this.materials.push({
                  name: '',
                  smooth: this.smooth
                });

              }

              return lastMultiMaterial;

            }
          };

          // Inherit previous objects material.
          // Spec tells us that a declared material must be set to all objects until a new material is declared.
          // If a usemtl declaration is encountered while this new object is being parsed, it will
          // overwrite the inherited material. Exception being that there was already face declarations
          // to the inherited material, then it will be preserved for proper MultiMaterial continuation.

          if (previousMaterial && previousMaterial.name && typeof previousMaterial.clone === 'function') {

            var declared = previousMaterial.clone(0);
            declared.inherited = true;
            this.object.materials.push(declared);

          }

          this.objects.push(this.object);

        },

        finalize: function () {

          if (this.object && typeof this.object._finalize === 'function') {

            this.object._finalize(true);

          }

        },

        parseVertexIndex: function (value, len) {

          var index = parseInt(value, 10);
          return (index >= 0 ? index - 1 : index + len / 3) * 3;

        },

        parseNormalIndex: function (value, len) {

          var index = parseInt(value, 10);
          return (index >= 0 ? index - 1 : index + len / 3) * 3;

        },

        parseUVIndex: function (value, len) {

          var index = parseInt(value, 10);
          return (index >= 0 ? index - 1 : index + len / 2) * 2;

        },

        addVertex: function (a, b, c) {

          var src = this.vertices;
          var dst = this.object.geometry.vertices;

          dst.push(src[a + 0], src[a + 1], src[a + 2]);
          dst.push(src[b + 0], src[b + 1], src[b + 2]);
          dst.push(src[c + 0], src[c + 1], src[c + 2]);

        },

        addVertexPoint: function (a) {

          var src = this.vertices;
          var dst = this.object.geometry.vertices;

          dst.push(src[a + 0], src[a + 1], src[a + 2]);

        },

        addVertexLine: function (a) {

          var src = this.vertices;
          var dst = this.object.geometry.vertices;

          dst.push(src[a + 0], src[a + 1], src[a + 2]);

        },

        addNormal: function (a, b, c) {

          var src = this.normals;
          var dst = this.object.geometry.normals;

          dst.push(src[a + 0], src[a + 1], src[a + 2]);
          dst.push(src[b + 0], src[b + 1], src[b + 2]);
          dst.push(src[c + 0], src[c + 1], src[c + 2]);

        },

        addColor: function (a, b, c) {

          var src = this.colors;
          var dst = this.object.geometry.colors;

          dst.push(src[a + 0], src[a + 1], src[a + 2]);
          dst.push(src[b + 0], src[b + 1], src[b + 2]);
          dst.push(src[c + 0], src[c + 1], src[c + 2]);

        },

        addUV: function (a, b, c) {

          var src = this.uvs;
          var dst = this.object.geometry.uvs;

          dst.push(src[a + 0], src[a + 1]);
          dst.push(src[b + 0], src[b + 1]);
          dst.push(src[c + 0], src[c + 1]);

        },

        addUVLine: function (a) {

          var src = this.uvs;
          var dst = this.object.geometry.uvs;

          dst.push(src[a + 0], src[a + 1]);

        },

        addFace: function (a, b, c, ua, ub, uc, na, nb, nc) {

          var vLen = this.vertices.length;

          var ia = this.parseVertexIndex(a, vLen);
          var ib = this.parseVertexIndex(b, vLen);
          var ic = this.parseVertexIndex(c, vLen);

          this.addVertex(ia, ib, ic);

          if (this.colors.length > 0) {

            this.addColor(ia, ib, ic);

          }

          if (ua !== undefined && ua !== '') {

            var uvLen = this.uvs.length;
            ia = this.parseUVIndex(ua, uvLen);
            ib = this.parseUVIndex(ub, uvLen);
            ic = this.parseUVIndex(uc, uvLen);
            this.addUV(ia, ib, ic);

          }

          if (na !== undefined && na !== '') {

            // Normals are many times the same. If so, skip function call and parseInt.
            var nLen = this.normals.length;
            ia = this.parseNormalIndex(na, nLen);

            ib = na === nb ? ia : this.parseNormalIndex(nb, nLen);
            ic = na === nc ? ia : this.parseNormalIndex(nc, nLen);

            this.addNormal(ia, ib, ic);

          }

        },

        addPointGeometry: function (vertices) {

          this.object.geometry.type = 'Points';

          var vLen = this.vertices.length;

          for (var vi = 0, l = vertices.length; vi < l; vi++) {

            this.addVertexPoint(this.parseVertexIndex(vertices[vi], vLen));

          }

        },

        addLineGeometry: function (vertices, uvs) {

          this.object.geometry.type = 'Line';

          var vLen = this.vertices.length;
          var uvLen = this.uvs.length;

          for (var vi = 0, l = vertices.length; vi < l; vi++) {

            this.addVertexLine(this.parseVertexIndex(vertices[vi], vLen));

          }

          for (var uvi = 0, l = uvs.length; uvi < l; uvi++) {

            this.addUVLine(this.parseUVIndex(uvs[uvi], uvLen));

          }

        }

      };

      state.startObject('', false);

      return state;

    }

    //

    function OBJLoader(manager) {

      THREE.Loader.call(this, manager);

      this.materials = null;

    }

    OBJLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {

      constructor: OBJLoader,

      load: function (url, onLoad, onProgress, onError) {

        var scope = this;

        var loader = new THREE.FileLoader(scope.manager);
        loader.setPath(this.path);
        loader.load(url, function (text) {

          onLoad(scope.parse(text));

        }, onProgress, onError);

      },

      setMaterials: function (materials) {

        this.materials = materials;

        return this;

      },

      parse: function (text) {

        console.time('OBJLoader');

        var state = new ParserState();

        if (text.indexOf('\r\n') !== - 1) {

          // This is faster than String.split with regex that splits on both
          text = text.replace(/\r\n/g, '\n');

        }

        if (text.indexOf('\\\n') !== - 1) {

          // join lines separated by a line continuation character (\)
          text = text.replace(/\\\n/g, '');

        }

        var lines = text.split('\n');
        var line = '', lineFirstChar = '';
        var lineLength = 0;
        var result = [];

        // Faster to just trim left side of the line. Use if available.
        var trimLeft = (typeof ''.trimLeft === 'function');

        for (var i = 0, l = lines.length; i < l; i++) {

          line = lines[i];

          line = trimLeft ? line.trimLeft() : line.trim();

          lineLength = line.length;

          if (lineLength === 0) continue;

          lineFirstChar = line.charAt(0);

          // @todo invoke passed in handler if any
          if (lineFirstChar === '#') continue;

          if (lineFirstChar === 'v') {

            var data = line.split(/\s+/);

            switch (data[0]) {

              case 'v':
                state.vertices.push(
                  parseFloat(data[1]),
                  parseFloat(data[2]),
                  parseFloat(data[3])
                );
                if (data.length >= 7) {

                  state.colors.push(
                    parseFloat(data[4]),
                    parseFloat(data[5]),
                    parseFloat(data[6])

                  );

                }
                break;
              case 'vn':
                state.normals.push(
                  parseFloat(data[1]),
                  parseFloat(data[2]),
                  parseFloat(data[3])
                );
                break;
              case 'vt':
                state.uvs.push(
                  parseFloat(data[1]),
                  parseFloat(data[2])
                );
                break;

            }

          } else if (lineFirstChar === 'f') {

            var lineData = line.substr(1).trim();
            var vertexData = lineData.split(/\s+/);
            var faceVertices = [];

            // Parse the face vertex data into an easy to work with format

            for (var j = 0, jl = vertexData.length; j < jl; j++) {

              var vertex = vertexData[j];

              if (vertex.length > 0) {

                var vertexParts = vertex.split('/');
                faceVertices.push(vertexParts);

              }

            }

            // Draw an edge between the first vertex and all subsequent vertices to form an n-gon

            var v1 = faceVertices[0];

            for (var j = 1, jl = faceVertices.length - 1; j < jl; j++) {

              var v2 = faceVertices[j];
              var v3 = faceVertices[j + 1];

              state.addFace(
                v1[0], v2[0], v3[0],
                v1[1], v2[1], v3[1],
                v1[2], v2[2], v3[2]
              );

            }

          } else if (lineFirstChar === 'l') {

            var lineParts = line.substring(1).trim().split(" ");
            var lineVertices = [], lineUVs = [];

            if (line.indexOf("/") === - 1) {

              lineVertices = lineParts;

            } else {

              for (var li = 0, llen = lineParts.length; li < llen; li++) {

                var parts = lineParts[li].split("/");

                if (parts[0] !== "") lineVertices.push(parts[0]);
                if (parts[1] !== "") lineUVs.push(parts[1]);

              }

            }
            state.addLineGeometry(lineVertices, lineUVs);

          } else if (lineFirstChar === 'p') {

            var lineData = line.substr(1).trim();
            var pointData = lineData.split(" ");

            state.addPointGeometry(pointData);

          } else if ((result = object_pattern.exec(line)) !== null) {

            // o object_name
            // or
            // g group_name

            // WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
            // var name = result[ 0 ].substr( 1 ).trim();
            var name = (" " + result[0].substr(1).trim()).substr(1);

            state.startObject(name);

          } else if (material_use_pattern.test(line)) {

            // material

            state.object.startMaterial(line.substring(7).trim(), state.materialLibraries);

          } else if (material_library_pattern.test(line)) {

            // mtl file

            state.materialLibraries.push(line.substring(7).trim());

          } else if (lineFirstChar === 's') {

            result = line.split(' ');

            // smooth shading

            // @todo Handle files that have varying smooth values for a set of faces inside one geometry,
            // but does not define a usemtl for each face set.
            // This should be detected and a dummy material created (later MultiMaterial and geometry groups).
            // This requires some care to not create extra material on each smooth value for "normal" obj files.
            // where explicit usemtl defines geometry groups.
            // Example asset: examples/models/obj/cerberus/Cerberus.obj

            /*
             * http://paulbourke.net/dataformats/obj/
             * or
             * http://www.cs.utah.edu/~boulos/cs3505/obj_spec.pdf
             *
             * From chapter "Grouping" Syntax explanation "s group_number":
             * "group_number is the smoothing group number. To turn off smoothing groups, use a value of 0 or off.
             * Polygonal elements use group numbers to put elements in different smoothing groups. For free-form
             * surfaces, smoothing groups are either turned on or off; there is no difference between values greater
             * than 0."
             */
            if (result.length > 1) {

              var value = result[1].trim().toLowerCase();
              state.object.smooth = (value !== '0' && value !== 'off');

            } else {

              // ZBrush can produce "s" lines #11707
              state.object.smooth = true;

            }
            var material = state.object.currentMaterial();
            if (material) material.smooth = state.object.smooth;

          } else {

            // Handle null terminated files without exception
            if (line === '\0') continue;

            throw new Error('THREE.OBJLoader: Unexpected line: "' + line + '"');

          }

        }

        state.finalize();

        var container = new THREE.Group();
        container.materialLibraries = [].concat(state.materialLibraries);

        for (var i = 0, l = state.objects.length; i < l; i++) {

          var object = state.objects[i];
          var geometry = object.geometry;
          var materials = object.materials;
          var isLine = (geometry.type === 'Line');
          var isPoints = (geometry.type === 'Points');
          var hasVertexColors = false;

          // Skip o/g line declarations that did not follow with any faces
          if (geometry.vertices.length === 0) continue;

          var buffergeometry = new THREE.BufferGeometry();

          buffergeometry.addAttribute('position', new THREE.Float32BufferAttribute(geometry.vertices, 3));

          if (geometry.normals.length > 0) {

            buffergeometry.addAttribute('normal', new THREE.Float32BufferAttribute(geometry.normals, 3));

          } else {

            buffergeometry.computeVertexNormals();

          }

          if (geometry.colors.length > 0) {

            hasVertexColors = true;
            buffergeometry.addAttribute('color', new THREE.Float32BufferAttribute(geometry.colors, 3));

          }

          if (geometry.uvs.length > 0) {

            buffergeometry.addAttribute('uv', new THREE.Float32BufferAttribute(geometry.uvs, 2));

          }

          // Create materials

          var createdMaterials = [];

          for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {

            var sourceMaterial = materials[mi];
            var material = undefined;

            if (this.materials !== null) {

              material = this.materials.create(sourceMaterial.name);

              // mtl etc. loaders probably can't create line materials correctly, copy properties to a line material.
              if (isLine && material && !(material instanceof THREE.LineBasicMaterial)) {

                var materialLine = new THREE.LineBasicMaterial();
                THREE.Material.prototype.copy.call(materialLine, material);
                materialLine.color.copy(material.color);
                material = materialLine;

              } else if (isPoints && material && !(material instanceof THREE.PointsMaterial)) {

                var materialPoints = new THREE.PointsMaterial({ size: 10, sizeAttenuation: false });
                THREE.Material.prototype.copy.call(materialPoints, material);
                materialPoints.color.copy(material.color);
                materialPoints.map = material.map;
                material = materialPoints;

              }

            }

            if (!material) {

              if (isLine) {

                material = new THREE.LineBasicMaterial();

              } else if (isPoints) {

                material = new THREE.PointsMaterial({ size: 1, sizeAttenuation: false });

              } else {

                material = new THREE.MeshPhongMaterial();

              }

              material.name = sourceMaterial.name;

            }

            material.flatShading = sourceMaterial.smooth ? false : true;
            material.vertexColors = hasVertexColors ? THREE.VertexColors : THREE.NoColors;

            createdMaterials.push(material);

          }

          // Create mesh

          var mesh;

          if (createdMaterials.length > 1) {

            for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {

              var sourceMaterial = materials[mi];
              buffergeometry.addGroup(sourceMaterial.groupStart, sourceMaterial.groupCount, mi);

            }

            if (isLine) {

              mesh = new THREE.LineSegments(buffergeometry, createdMaterials);

            } else if (isPoints) {

              mesh = new THREE.Points(buffergeometry, createdMaterials);

            } else {

              mesh = new THREE.Mesh(buffergeometry, createdMaterials);

            }

          } else {

            if (isLine) {

              mesh = new THREE.LineSegments(buffergeometry, createdMaterials[0]);

            } else if (isPoints) {

              mesh = new THREE.Points(buffergeometry, createdMaterials[0]);

            } else {

              mesh = new THREE.Mesh(buffergeometry, createdMaterials[0]);

            }

          }

          mesh.name = object.name;

          container.add(mesh);

        }

        console.timeEnd('OBJLoader');

        return container;

      }

    });

    return OBJLoader;

  })();

  'use strict';
  var
    transferableMessage = self.webkitPostMessage || self.postMessage,

    // enum
    MESSAGE_TYPES = {
      WORLDREPORT: 0,
      COLLISIONREPORT: 1,
      VEHICLEREPORT: 2,
      CONSTRAINTREPORT: 3
    },

    // temp variables
    _object,
    _vector,
    _transform,

    // functions
    public_functions = {},
    getShapeFromCache,
    setShapeCache,
    createShape,
    reportWorld,
    reportVehicles,
    reportCollisions,
    reportConstraints,

    // world variables
    fixedTimeStep, // used when calling stepSimulation
    rateLimit, // sets whether or not to sync the simulation rate with fixedTimeStep
    last_simulation_time,
    last_simulation_duration = 0,
    world,
    transform,
    _vec3_1,
    _vec3_2,
    _vec3_3,
    _quat,
    // private cache
    _objects = {},
    _vehicles = {},
    _constraints = {},
    _materials = {},
    _objects_ammo = {},
    _num_objects = 0,
    _num_wheels = 0,
    _num_constraints = 0,
    _object_shapes = {},

    // The following objects are to track objects that ammo.js doesn't clean
    // up. All are cleaned up when they're corresponding body is destroyed.
    // Unfortunately, it's very difficult to get at these objects from the
    // body, so we have to track them ourselves.
    _motion_states = {},
    // Don't need to worry about it for cached shapes.
    _noncached_shapes = {},
    // A body with a compound shape always has a regular shape as well, so we
    // have track them separately.
    _compound_shapes = {},

    // object reporting
    REPORT_CHUNKSIZE, // report array is increased in increments of this chunk size

    WORLDREPORT_ITEMSIZE = 14, // how many float values each reported item needs
    worldreport,

    COLLISIONREPORT_ITEMSIZE = 5, // one float for each object id, and a Vec3 contact normal
    collisionreport,

    VEHICLEREPORT_ITEMSIZE = 9, // vehicle id, wheel index, 3 for position, 4 for rotation
    vehiclereport,

    CONSTRAINTREPORT_ITEMSIZE = 6, // constraint id, offset object, offset, applied impulse
    constraintreport;

  var ab = new ArrayBuffer(1);

  transferableMessage(ab, [ab]);
  var SUPPORT_TRANSFERABLE = (ab.byteLength === 0);

  getShapeFromCache = function (cache_key) {
    if (_object_shapes[cache_key] !== undefined) {
      return _object_shapes[cache_key];
    }
    return null;
  };

  setShapeCache = function (cache_key, shape) {
    _object_shapes[cache_key] = shape;
  }

  createShape = function (description) {
    var cache_key, shape;

    _transform.setIdentity();
    switch (description.type) {
      case 'plane':
        cache_key = 'plane_' + description.normal.x + '_' + description.normal.y + '_' + description.normal.z;
        if ((shape = getShapeFromCache(cache_key)) === null) {
          _vec3_1.setX(description.normal.x);
          _vec3_1.setY(description.normal.y);
          _vec3_1.setZ(description.normal.z);
          shape = new Ammo.btStaticPlaneShape(_vec3_1, 0);
          setShapeCache(cache_key, shape);
        }
        break;

      case 'box':
        cache_key = 'box_' + description.width + '_' + description.height + '_' + description.depth;
        if ((shape = getShapeFromCache(cache_key)) === null) {
          _vec3_1.setX(description.width / 2);
          _vec3_1.setY(description.height / 2);
          _vec3_1.setZ(description.depth / 2);
          shape = new Ammo.btBoxShape(_vec3_1);
          setShapeCache(cache_key, shape);
        }
        break;

      case 'sphere':
        cache_key = 'sphere_' + description.radius;
        if ((shape = getShapeFromCache(cache_key)) === null) {
          shape = new Ammo.btSphereShape(description.radius);
          setShapeCache(cache_key, shape);
        }
        break;

      case 'cylinder':
        cache_key = 'cylinder_' + description.width + '_' + description.height + '_' + description.depth;
        if ((shape = getShapeFromCache(cache_key)) === null) {
          _vec3_1.setX(description.width / 2);
          _vec3_1.setY(description.height / 2);
          _vec3_1.setZ(description.depth / 2);
          shape = new Ammo.btCylinderShape(_vec3_1);
          setShapeCache(cache_key, shape);
        }
        break;

      case 'capsule':
        cache_key = 'capsule_' + description.radius + '_' + description.height;
        if ((shape = getShapeFromCache(cache_key)) === null) {
          // In Bullet, capsule height excludes the end spheres
          shape = new Ammo.btCapsuleShape(description.radius, description.height - 2 * description.radius);
          setShapeCache(cache_key, shape);
        }
        break;

      case 'cone':
        cache_key = 'cone_' + description.radius + '_' + description.height;
        if ((shape = getShapeFromCache(cache_key)) === null) {
          shape = new Ammo.btConeShape(description.radius, description.height);
          setShapeCache(cache_key, shape);
        }
        break;

      case 'concave':
        var i, triangle, triangle_mesh = new Ammo.btTriangleMesh;
        if (!description.triangles.length) return false

        for (i = 0; i < description.triangles.length; i++) {
          triangle = description.triangles[i];

          _vec3_1.setX(triangle[0].x);
          _vec3_1.setY(triangle[0].y);
          _vec3_1.setZ(triangle[0].z);

          _vec3_2.setX(triangle[1].x);
          _vec3_2.setY(triangle[1].y);
          _vec3_2.setZ(triangle[1].z);

          _vec3_3.setX(triangle[2].x);
          _vec3_3.setY(triangle[2].y);
          _vec3_3.setZ(triangle[2].z);

          triangle_mesh.addTriangle(
            _vec3_1,
            _vec3_2,
            _vec3_3,
            true
          );
        }

        shape = new Ammo.btBvhTriangleMeshShape(
          triangle_mesh,
          true,
          true
        );
        _noncached_shapes[description.id] = shape;
        break;

      case 'convex':
        var i, point, shape = new Ammo.btConvexHullShape;
        for (i = 0; i < description.points.length; i++) {
          point = description.points[i];

          _vec3_1.setX(point.x);
          _vec3_1.setY(point.y);
          _vec3_1.setZ(point.z);

          shape.addPoint(_vec3_1);

        }
        _noncached_shapes[description.id] = shape;
        break;

      case 'heightfield':

        var ptr = Ammo.allocate(4 * description.xpts * description.ypts, "float", Ammo.ALLOC_NORMAL);

        for (var f = 0; f < description.points.length; f++) {
          Ammo.setValue(ptr + f, description.points[f], 'float');
        }

        shape = new Ammo.btHeightfieldTerrainShape(
          description.xpts,
          description.ypts,
          ptr,
          1,
          -description.absMaxHeight,
          description.absMaxHeight,
          2,
          0,
          false
        );

        _vec3_1.setX(description.xsize / (description.xpts - 1));
        _vec3_1.setY(description.ysize / (description.ypts - 1));
        _vec3_1.setZ(1);

        shape.setLocalScaling(_vec3_1);
        _noncached_shapes[description.id] = shape;
        break;

      default:
        // Not recognized
        return;
        break;
    }

    return shape;
  };

  public_functions.init = function (params) {
    importScripts(params.ammo);

    _transform = new Ammo.btTransform;
    _vec3_1 = new Ammo.btVector3(0, 0, 0);
    _vec3_2 = new Ammo.btVector3(0, 0, 0);
    _vec3_3 = new Ammo.btVector3(0, 0, 0);
    _quat = new Ammo.btQuaternion(0, 0, 0, 0);

    REPORT_CHUNKSIZE = params.reportsize || 50;
    if (SUPPORT_TRANSFERABLE) {
      // Transferable messages are supported, take advantage of them with TypedArrays
      worldreport = new Float32Array(2 + REPORT_CHUNKSIZE * WORLDREPORT_ITEMSIZE); // message id + # of objects to report + chunk size * # of values per object
      collisionreport = new Float32Array(2 + REPORT_CHUNKSIZE * COLLISIONREPORT_ITEMSIZE); // message id + # of collisions to report + chunk size * # of values per object
      vehiclereport = new Float32Array(2 + REPORT_CHUNKSIZE * VEHICLEREPORT_ITEMSIZE); // message id + # of vehicles to report + chunk size * # of values per object
      constraintreport = new Float32Array(2 + REPORT_CHUNKSIZE * CONSTRAINTREPORT_ITEMSIZE); // message id + # of constraints to report + chunk size * # of values per object
    } else {
      // Transferable messages are not supported, send data as normal arrays
      worldreport = [];
      collisionreport = [];
      vehiclereport = [];
      constraintreport = [];
    }
    worldreport[0] = MESSAGE_TYPES.WORLDREPORT;
    collisionreport[0] = MESSAGE_TYPES.COLLISIONREPORT;
    vehiclereport[0] = MESSAGE_TYPES.VEHICLEREPORT;
    constraintreport[0] = MESSAGE_TYPES.CONSTRAINTREPORT;

    var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration,
      dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
      solver = new Ammo.btSequentialImpulseConstraintSolver,
      broadphase;

    if (!params.broadphase) params.broadphase = { type: 'dynamic' };
    switch (params.broadphase.type) {
      case 'sweepprune':

        _vec3_1.setX(params.broadphase.aabbmin.x);
        _vec3_1.setY(params.broadphase.aabbmin.y);
        _vec3_1.setZ(params.broadphase.aabbmin.z);

        _vec3_2.setX(params.broadphase.aabbmax.x);
        _vec3_2.setY(params.broadphase.aabbmax.y);
        _vec3_2.setZ(params.broadphase.aabbmax.z);

        broadphase = new Ammo.btAxisSweep3(
          _vec3_1,
          _vec3_2
        );

        break;

      case 'dynamic':
      default:
        broadphase = new Ammo.btDbvtBroadphase;
        break;
    }

    world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);

    fixedTimeStep = params.fixedTimeStep;
    rateLimit = params.rateLimit;

    transferableMessage({ cmd: 'worldReady' });
  };

  public_functions.registerMaterial = function (description) {
    _materials[description.id] = description;
  };

  public_functions.unRegisterMaterial = function (description) {
    delete _materials[description.id];
  };

  public_functions.setFixedTimeStep = function (description) {
    fixedTimeStep = description;
  };

  public_functions.setGravity = function (description) {
    _vec3_1.setX(description.x);
    _vec3_1.setY(description.y);
    _vec3_1.setZ(description.z);
    world.setGravity(_vec3_1);
  };

  public_functions.addObject = function (description) {

    var i,
      localInertia, shape, motionState, rbInfo, body;

    shape = createShape(description);
    if (!shape) return
    // If there are children then this is a compound shape
    if (description.children) {
      var compound_shape = new Ammo.btCompoundShape, _child;
      compound_shape.addChildShape(_transform, shape);

      for (i = 0; i < description.children.length; i++) {
        _child = description.children[i];

        var trans = new Ammo.btTransform;
        trans.setIdentity();

        _vec3_1.setX(_child.position_offset.x);
        _vec3_1.setY(_child.position_offset.y);
        _vec3_1.setZ(_child.position_offset.z);
        trans.setOrigin(_vec3_1);

        _quat.setX(_child.rotation.x);
        _quat.setY(_child.rotation.y);
        _quat.setZ(_child.rotation.z);
        _quat.setW(_child.rotation.w);
        trans.setRotation(_quat);

        shape = createShape(description.children[i]);
        compound_shape.addChildShape(trans, shape);
        Ammo.destroy(trans);
      }

      shape = compound_shape;
      _compound_shapes[description.id] = shape;
    }
    _vec3_1.setX(0);
    _vec3_1.setY(0);
    _vec3_1.setZ(0);
    shape.calculateLocalInertia(description.mass, _vec3_1);

    _transform.setIdentity();

    _vec3_2.setX(description.position.x);
    _vec3_2.setY(description.position.y);
    _vec3_2.setZ(description.position.z);
    _transform.setOrigin(_vec3_2);

    _quat.setX(description.rotation.x);
    _quat.setY(description.rotation.y);
    _quat.setZ(description.rotation.z);
    _quat.setW(description.rotation.w);
    _transform.setRotation(_quat);

    motionState = new Ammo.btDefaultMotionState(_transform); // #TODO: btDefaultMotionState supports center of mass offset as second argument - implement
    rbInfo = new Ammo.btRigidBodyConstructionInfo(description.mass, motionState, shape, _vec3_1);

    if (description.materialId !== undefined) {
      rbInfo.set_m_friction(_materials[description.materialId].friction);
      rbInfo.set_m_restitution(_materials[description.materialId].restitution);
    }

    body = new Ammo.btRigidBody(rbInfo);
    Ammo.destroy(rbInfo);

    if (typeof description.collision_flags !== 'undefined') {
      body.setCollisionFlags(description.collision_flags);
    }

    world.addRigidBody(body);

    body.id = description.id;
    _objects[body.id] = body;
    _motion_states[body.id] = motionState;

    var ptr = body.a != undefined ? body.a : body.ptr;
    _objects_ammo[ptr] = body.id;
    _num_objects++;

    transferableMessage({ cmd: 'objectReady', params: body.id });
  };

  public_functions.addVehicle = function (description) {
    var vehicle_tuning = new Ammo.btVehicleTuning(),
      vehicle;

    vehicle_tuning.set_m_suspensionStiffness(description.suspension_stiffness);
    vehicle_tuning.set_m_suspensionCompression(description.suspension_compression);
    vehicle_tuning.set_m_suspensionDamping(description.suspension_damping);
    vehicle_tuning.set_m_maxSuspensionTravelCm(description.max_suspension_travel);
    vehicle_tuning.set_m_maxSuspensionForce(description.max_suspension_force);

    vehicle = new Ammo.btRaycastVehicle(vehicle_tuning, _objects[description.rigidBody], new Ammo.btDefaultVehicleRaycaster(world));
    vehicle.tuning = vehicle_tuning;

    _objects[description.rigidBody].setActivationState(4);
    vehicle.setCoordinateSystem(0, 1, 2);

    world.addVehicle(vehicle);
    _vehicles[description.id] = vehicle;
  };
  public_functions.removeVehicle = function (description) {
    delete _vehicles[description.id];
  };

  public_functions.addWheel = function (description) {
    if (_vehicles[description.id] !== undefined) {
      var tuning = _vehicles[description.id].tuning;
      if (description.tuning !== undefined) {
        tuning = new Ammo.btVehicleTuning();
        tuning.set_m_suspensionStiffness(description.tuning.suspension_stiffness);
        tuning.set_m_suspensionCompression(description.tuning.suspension_compression);
        tuning.set_m_suspensionDamping(description.tuning.suspension_damping);
        tuning.set_m_maxSuspensionTravelCm(description.tuning.max_suspension_travel);
        tuning.set_m_maxSuspensionForce(description.tuning.max_suspension_force);
      }

      _vec3_1.setX(description.connection_point.x);
      _vec3_1.setY(description.connection_point.y);
      _vec3_1.setZ(description.connection_point.z);

      _vec3_2.setX(description.wheel_direction.x);
      _vec3_2.setY(description.wheel_direction.y);
      _vec3_2.setZ(description.wheel_direction.z);

      _vec3_3.setX(description.wheel_axle.x);
      _vec3_3.setY(description.wheel_axle.y);
      _vec3_3.setZ(description.wheel_axle.z);

      _vehicles[description.id].addWheel(
        _vec3_1,
        _vec3_2,
        _vec3_3,
        description.suspension_rest_length,
        description.wheel_radius,
        tuning,
        description.is_front_wheel
      );
    }

    _num_wheels++;

    if (SUPPORT_TRANSFERABLE) {
      vehiclereport = new Float32Array(1 + _num_wheels * VEHICLEREPORT_ITEMSIZE); // message id & ( # of objects to report * # of values per object )
      vehiclereport[0] = MESSAGE_TYPES.VEHICLEREPORT;
    } else {
      vehiclereport = [MESSAGE_TYPES.VEHICLEREPORT];
    }
  };

  public_functions.setSteering = function (details) {
    if (_vehicles[details.id] !== undefined) {
      _vehicles[details.id].setSteeringValue(details.steering, details.wheel);
    }
  };
  public_functions.setBrake = function (details) {
    if (_vehicles[details.id] !== undefined) {
      _vehicles[details.id].setBrake(details.brake, details.wheel);
    }
  };
  public_functions.applyEngineForce = function (details) {
    if (_vehicles[details.id] !== undefined) {
      _vehicles[details.id].applyEngineForce(details.force, details.wheel);
    }
  };

  public_functions.removeObject = function (details) {
    world.removeRigidBody(_objects[details.id]);
    Ammo.destroy(_objects[details.id]);
    Ammo.destroy(_motion_states[details.id]);
    if (_compound_shapes[details.id]) Ammo.destroy(_compound_shapes[details.id]);
    if (_noncached_shapes[details.id]) Ammo.destroy(_noncached_shapes[details.id]);
    var ptr = _objects[details.id].a != undefined ? _objects[details.id].a : _objects[details.id].ptr;
    delete _objects_ammo[ptr];
    delete _objects[details.id];
    delete _motion_states[details.id];
    if (_compound_shapes[details.id]) delete _compound_shapes[details.id];
    if (_noncached_shapes[details.id]) delete _noncached_shapes[details.id];
    _num_objects--;
  };

  public_functions.updateTransform = function (details) {
    _object = _objects[details.id];
    _object.getMotionState().getWorldTransform(_transform);

    if (details.pos) {
      _vec3_1.setX(details.pos.x);
      _vec3_1.setY(details.pos.y);
      _vec3_1.setZ(details.pos.z);
      _transform.setOrigin(_vec3_1);
    }

    if (details.quat) {
      _quat.setX(details.quat.x);
      _quat.setY(details.quat.y);
      _quat.setZ(details.quat.z);
      _quat.setW(details.quat.w);
      _transform.setRotation(_quat);
    }

    _object.setWorldTransform(_transform);
    _object.activate();
  };

  public_functions.updateMass = function (details) {
    // #TODO: changing a static object into dynamic is buggy
    _object = _objects[details.id];

    // Per http://www.bulletphysics.org/Bullet/phpBB3/viewtopic.php?p=&f=9&t=3663#p13816
    world.removeRigidBody(_object);

    _vec3_1.setX(0);
    _vec3_1.setY(0);
    _vec3_1.setZ(0);

    _object.setMassProps(details.mass, _vec3_1);
    world.addRigidBody(_object);
    _object.activate();
  };

  public_functions.applyCentralImpulse = function (details) {

    _vec3_1.setX(details.x);
    _vec3_1.setY(details.y);
    _vec3_1.setZ(details.z);

    _objects[details.id].applyCentralImpulse(_vec3_1);
    _objects[details.id].activate();
  };

  public_functions.applyImpulse = function (details) {

    _vec3_1.setX(details.impulse_x);
    _vec3_1.setY(details.impulse_y);
    _vec3_1.setZ(details.impulse_z);

    _vec3_2.setX(details.x);
    _vec3_2.setY(details.y);
    _vec3_2.setZ(details.z);

    _objects[details.id].applyImpulse(
      _vec3_1,
      _vec3_2
    );
    _objects[details.id].activate();
  };

  public_functions.applyTorque = function (details) {

    _vec3_1.setX(details.torque_x);
    _vec3_1.setY(details.torque_y);
    _vec3_1.setZ(details.torque_z);

    _objects[details.id].applyTorque(
      _vec3_1
    );
    _objects[details.id].activate();
  };

  public_functions.applyCentralForce = function (details) {

    _vec3_1.setX(details.x);
    _vec3_1.setY(details.y);
    _vec3_1.setZ(details.z);

    _objects[details.id].applyCentralForce(_vec3_1);
    _objects[details.id].activate();
  };

  public_functions.applyForce = function (details) {

    _vec3_1.setX(details.force_x);
    _vec3_1.setY(details.force_y);
    _vec3_1.setZ(details.force_z);

    _vec3_2.setX(details.x);
    _vec3_2.setY(details.y);
    _vec3_2.setZ(details.z);

    _objects[details.id].applyForce(
      _vec3_1,
      _vec3_2
    );
    _objects[details.id].activate();
  };

  public_functions.onSimulationResume = function (params) {
    last_simulation_time = Date.now();
  };

  public_functions.setAngularVelocity = function (details) {

    _vec3_1.setX(details.x);
    _vec3_1.setY(details.y);
    _vec3_1.setZ(details.z);

    _objects[details.id].setAngularVelocity(
      _vec3_1
    );
    _objects[details.id].activate();
  };

  public_functions.setLinearVelocity = function (details) {

    _vec3_1.setX(details.x);
    _vec3_1.setY(details.y);
    _vec3_1.setZ(details.z);

    _objects[details.id].setLinearVelocity(
      _vec3_1
    );
    _objects[details.id].activate();
  };

  public_functions.setAngularFactor = function (details) {

    _vec3_1.setX(details.x);
    _vec3_1.setY(details.y);
    _vec3_1.setZ(details.z);

    _objects[details.id].setAngularFactor(
      _vec3_1
    );
  };

  public_functions.setLinearFactor = function (details) {

    _vec3_1.setX(details.x);
    _vec3_1.setY(details.y);
    _vec3_1.setZ(details.z);

    _objects[details.id].setLinearFactor(
      _vec3_1
    );
  };

  public_functions.setDamping = function (details) {
    _objects[details.id].setDamping(details.linear, details.angular);
  };

  public_functions.setCcdMotionThreshold = function (details) {
    _objects[details.id].setCcdMotionThreshold(details.threshold);
  };

  public_functions.setCcdSweptSphereRadius = function (details) {
    _objects[details.id].setCcdSweptSphereRadius(details.radius);
  };

  public_functions.addConstraint = function (details) {
    var constraint;

    switch (details.type) {

      case 'point':
        if (details.objectb === undefined) {

          _vec3_1.setX(details.positiona.x);
          _vec3_1.setY(details.positiona.y);
          _vec3_1.setZ(details.positiona.z);

          constraint = new Ammo.btPoint2PointConstraint(
            _objects[details.objecta],
            _vec3_1
          );
        } else {

          _vec3_1.setX(details.positiona.x);
          _vec3_1.setY(details.positiona.y);
          _vec3_1.setZ(details.positiona.z);

          _vec3_2.setX(details.positionb.x);
          _vec3_2.setY(details.positionb.y);
          _vec3_2.setZ(details.positionb.z);

          constraint = new Ammo.btPoint2PointConstraint(
            _objects[details.objecta],
            _objects[details.objectb],
            _vec3_1,
            _vec3_2
          );
        }
        break;

      case 'hinge':
        if (details.objectb === undefined) {

          _vec3_1.setX(details.positiona.x);
          _vec3_1.setY(details.positiona.y);
          _vec3_1.setZ(details.positiona.z);

          _vec3_2.setX(details.axis.x);
          _vec3_2.setY(details.axis.y);
          _vec3_2.setZ(details.axis.z);

          constraint = new Ammo.btHingeConstraint(
            _objects[details.objecta],
            _vec3_1,
            _vec3_2
          );
        } else {

          _vec3_1.setX(details.positiona.x);
          _vec3_1.setY(details.positiona.y);
          _vec3_1.setZ(details.positiona.z);

          _vec3_2.setX(details.positionb.x);
          _vec3_2.setY(details.positionb.y);
          _vec3_2.setZ(details.positionb.z);

          _vec3_3.setX(details.axis.x);
          _vec3_3.setY(details.axis.y);
          _vec3_3.setZ(details.axis.z);

          constraint = new Ammo.btHingeConstraint(
            _objects[details.objecta],
            _objects[details.objectb],
            _vec3_1,
            _vec3_2,
            _vec3_3,
            _vec3_3
          );
        }
        break;

      case 'slider':
        var transforma, transformb, rotation;

        transforma = new Ammo.btTransform();

        _vec3_1.setX(details.positiona.x);
        _vec3_1.setY(details.positiona.y);
        _vec3_1.setZ(details.positiona.z);

        transforma.setOrigin(_vec3_1);

        var rotation = transforma.getRotation();
        rotation.setEuler(details.axis.x, details.axis.y, details.axis.z);
        transforma.setRotation(rotation);

        if (details.objectb) {
          transformb = new Ammo.btTransform();

          _vec3_2.setX(details.positionb.x);
          _vec3_2.setY(details.positionb.y);
          _vec3_2.setZ(details.positionb.z);

          transformb.setOrigin(_vec3_2);

          rotation = transformb.getRotation();
          rotation.setEuler(details.axis.x, details.axis.y, details.axis.z);
          transformb.setRotation(rotation);

          constraint = new Ammo.btSliderConstraint(
            _objects[details.objecta],
            _objects[details.objectb],
            transforma,
            transformb,
            true
          );
        } else {
          constraint = new Ammo.btSliderConstraint(
            _objects[details.objecta],
            transforma,
            true
          );
        }

        Ammo.destroy(transforma);
        if (transformb != undefined) {
          Ammo.destroy(transformb);
        }
        break;

      case 'conetwist':
        var transforma, transformb;

        transforma = new Ammo.btTransform();
        transforma.setIdentity();

        transformb = new Ammo.btTransform();
        transformb.setIdentity();

        _vec3_1.setX(details.positiona.x);
        _vec3_1.setY(details.positiona.y);
        _vec3_1.setZ(details.positiona.z);

        _vec3_2.setX(details.positionb.x);
        _vec3_2.setY(details.positionb.y);
        _vec3_2.setZ(details.positionb.z);

        transforma.setOrigin(_vec3_1);
        transformb.setOrigin(_vec3_2);

        var rotation = transforma.getRotation();
        rotation.setEulerZYX(-details.axisa.z, -details.axisa.y, -details.axisa.x);
        transforma.setRotation(rotation);

        rotation = transformb.getRotation();
        rotation.setEulerZYX(-details.axisb.z, -details.axisb.y, -details.axisb.x);
        transformb.setRotation(rotation);

        constraint = new Ammo.btConeTwistConstraint(
          _objects[details.objecta],
          _objects[details.objectb],
          transforma,
          transformb
        );

        constraint.setLimit(Math.PI, 0, Math.PI);

        Ammo.destroy(transforma);
        Ammo.destroy(transformb);

        break;

      case 'dof':
        var transforma, transformb, rotation;

        transforma = new Ammo.btTransform();
        transforma.setIdentity();

        _vec3_1.setX(details.positiona.x);
        _vec3_1.setY(details.positiona.y);
        _vec3_1.setZ(details.positiona.z);

        transforma.setOrigin(_vec3_1);

        rotation = transforma.getRotation();
        rotation.setEulerZYX(-details.axisa.z, -details.axisa.y, -details.axisa.x);
        transforma.setRotation(rotation);

        if (details.objectb) {
          transformb = new Ammo.btTransform();
          transformb.setIdentity();

          _vec3_2.setX(details.positionb.x);
          _vec3_2.setY(details.positionb.y);
          _vec3_2.setZ(details.positionb.z);

          transformb.setOrigin(_vec3_2);

          rotation = transformb.getRotation();
          rotation.setEulerZYX(-details.axisb.z, -details.axisb.y, -details.axisb.x);
          transformb.setRotation(rotation);

          constraint = new Ammo.btGeneric6DofConstraint(
            _objects[details.objecta],
            _objects[details.objectb],
            transforma,
            transformb
          );
        } else {
          constraint = new Ammo.btGeneric6DofConstraint(
            _objects[details.objecta],
            transforma
          );
        }
        Ammo.destroy(transforma);
        if (transformb != undefined) {
          Ammo.destroy(transformb);
        }
        break;

      default:
        return;

    };

    world.addConstraint(constraint);

    constraint.enableFeedback();
    _constraints[details.id] = constraint;
    _num_constraints++;

    if (SUPPORT_TRANSFERABLE) {
      constraintreport = new Float32Array(1 + _num_constraints * CONSTRAINTREPORT_ITEMSIZE); // message id & ( # of objects to report * # of values per object )
      constraintreport[0] = MESSAGE_TYPES.CONSTRAINTREPORT;
    } else {
      constraintreport = [MESSAGE_TYPES.CONSTRAINTREPORT];
    }
  };

  public_functions.removeConstraint = function (details) {
    var constraint = _constraints[details.id];
    if (constraint !== undefined) {
      world.removeConstraint(constraint);
      delete _constraints[details.id];
      _num_constraints--;
    }
  };

  public_functions.constraint_setBreakingImpulseThreshold = function (details) {
    var constraint = _constraints[details.id];
    if (constraint !== undefind) {
      constraint.setBreakingImpulseThreshold(details.threshold);
    }
  };

  public_functions.simulate = function simulate(params) {
    if (world) {
      params = params || {};

      if (!params.timeStep) {
        if (last_simulation_time) {
          params.timeStep = 0;
          while (params.timeStep + last_simulation_duration <= fixedTimeStep) {
            params.timeStep = (Date.now() - last_simulation_time) / 1000; // time since last simulation
          }
        } else {
          params.timeStep = fixedTimeStep; // handle first frame
        }
      } else {
        if (params.timeStep < fixedTimeStep) {
          params.timeStep = fixedTimeStep;
        }
      }

      params.maxSubSteps = params.maxSubSteps || Math.ceil(params.timeStep / fixedTimeStep); // If maxSubSteps is not defined, keep the simulation fully up to date

      last_simulation_duration = Date.now();
      world.stepSimulation(params.timeStep, params.maxSubSteps, fixedTimeStep);

      reportVehicles();
      reportCollisions();
      reportConstraints();
      reportWorld();

      last_simulation_duration = (Date.now() - last_simulation_duration) / 1000;
      last_simulation_time = Date.now();
    }
  };


  // Constraint functions
  public_functions.hinge_setLimits = function (params) {
    _constraints[params.constraint].setLimit(params.low, params.high, 0, params.bias_factor, params.relaxation_factor);
  };
  public_functions.hinge_enableAngularMotor = function (params) {
    var constraint = _constraints[params.constraint];
    constraint.enableAngularMotor(true, params.velocity, params.acceleration);
    constraint.getRigidBodyA().activate();
    if (constraint.getRigidBodyB()) {
      constraint.getRigidBodyB().activate();
    }
  };
  public_functions.hinge_disableMotor = function (params) {
    _constraints[params.constraint].enableMotor(false);
    if (constraint.getRigidBodyB()) {
      constraint.getRigidBodyB().activate();
    }
  };

  public_functions.slider_setLimits = function (params) {
    var constraint = _constraints[params.constraint];
    constraint.setLowerLinLimit(params.lin_lower || 0);
    constraint.setUpperLinLimit(params.lin_upper || 0);

    constraint.setLowerAngLimit(params.ang_lower || 0);
    constraint.setUpperAngLimit(params.ang_upper || 0);
  };
  public_functions.slider_setRestitution = function (params) {
    var constraint = _constraints[params.constraint];
    constraint.setSoftnessLimLin(params.linear || 0);
    constraint.setSoftnessLimAng(params.angular || 0);
  };
  public_functions.slider_enableLinearMotor = function (params) {
    var constraint = _constraints[params.constraint];
    constraint.setTargetLinMotorVelocity(params.velocity);
    constraint.setMaxLinMotorForce(params.acceleration);
    constraint.setPoweredLinMotor(true);
    constraint.getRigidBodyA().activate();
    if (constraint.getRigidBodyB()) {
      constraint.getRigidBodyB().activate();
    }
  };
  public_functions.slider_disableLinearMotor = function (params) {
    var constraint = _constraints[params.constraint];
    constraint.setPoweredLinMotor(false);
    if (constraint.getRigidBodyB()) {
      constraint.getRigidBodyB().activate();
    }
  };
  public_functions.slider_enableAngularMotor = function (params) {
    var constraint = _constraints[params.constraint];
    constraint.setTargetAngMotorVelocity(params.velocity);
    constraint.setMaxAngMotorForce(params.acceleration);
    constraint.setPoweredAngMotor(true);
    constraint.getRigidBodyA().activate();
    if (constraint.getRigidBodyB()) {
      constraint.getRigidBodyB().activate();
    }
  };
  public_functions.slider_disableAngularMotor = function (params) {
    var constraint = _constraints[params.constraint];
    constraint.setPoweredAngMotor(false);
    constraint.getRigidBodyA().activate();
    if (constraint.getRigidBodyB()) {
      constraint.getRigidBodyB().activate();
    }
  };

  public_functions.conetwist_setLimit = function (params) {
    _constraints[params.constraint].setLimit(params.z, params.y, params.x); // ZYX order
  };
  public_functions.conetwist_enableMotor = function (params) {
    var constraint = _constraints[params.constraint];
    constraint.enableMotor(true);
    constraint.getRigidBodyA().activate();
    constraint.getRigidBodyB().activate();
  };
  public_functions.conetwist_setMaxMotorImpulse = function (params) {
    var constraint = _constraints[params.constraint];
    constraint.setMaxMotorImpulse(params.max_impulse);
    constraint.getRigidBodyA().activate();
    constraint.getRigidBodyB().activate();
  };
  public_functions.conetwist_setMotorTarget = function (params) {
    var constraint = _constraints[params.constraint];

    _quat.setX(params.x);
    _quat.setY(params.y);
    _quat.setZ(params.z);
    _quat.setW(params.w);

    constraint.setMotorTarget(_quat);

    constraint.getRigidBodyA().activate();
    constraint.getRigidBodyB().activate();
  };
  public_functions.conetwist_disableMotor = function (params) {
    var constraint = _constraints[params.constraint];
    constraint.enableMotor(false);
    constraint.getRigidBodyA().activate();
    constraint.getRigidBodyB().activate();
  };

  public_functions.dof_setLinearLowerLimit = function (params) {
    var constraint = _constraints[params.constraint];

    _vec3_1.setX(params.x);
    _vec3_1.setY(params.y);
    _vec3_1.setZ(params.z);

    constraint.setLinearLowerLimit(_vec3_1);

    constraint.getRigidBodyA().activate();
    if (constraint.getRigidBodyB()) {
      constraint.getRigidBodyB().activate();
    }
  };
  public_functions.dof_setLinearUpperLimit = function (params) {
    var constraint = _constraints[params.constraint];

    _vec3_1.setX(params.x);
    _vec3_1.setY(params.y);
    _vec3_1.setZ(params.z);

    constraint.setLinearUpperLimit(_vec3_1);

    constraint.getRigidBodyA().activate();
    if (constraint.getRigidBodyB()) {
      constraint.getRigidBodyB().activate();
    }
  };
  public_functions.dof_setAngularLowerLimit = function (params) {
    var constraint = _constraints[params.constraint];

    _vec3_1.setX(params.x);
    _vec3_1.setY(params.y);
    _vec3_1.setZ(params.z);

    constraint.setAngularLowerLimit(_vec3_1);

    constraint.getRigidBodyA().activate();
    if (constraint.getRigidBodyB()) {
      constraint.getRigidBodyB().activate();
    }
  };
  public_functions.dof_setAngularUpperLimit = function (params) {
    var constraint = _constraints[params.constraint];

    _vec3_1.setX(params.x);
    _vec3_1.setY(params.y);
    _vec3_1.setZ(params.z);

    constraint.setAngularUpperLimit(_vec3_1);

    constraint.getRigidBodyA().activate();
    if (constraint.getRigidBodyB()) {
      constraint.getRigidBodyB().activate();
    }
  };
  public_functions.dof_enableAngularMotor = function (params) {
    var constraint = _constraints[params.constraint];

    var motor = constraint.getRotationalLimitMotor(params.which);
    motor.set_m_enableMotor(true);

    constraint.getRigidBodyA().activate();
    if (constraint.getRigidBodyB()) {
      constraint.getRigidBodyB().activate();
    }
  };
  public_functions.dof_configureAngularMotor = function (params) {
    var constraint = _constraints[params.constraint];

    var motor = constraint.getRotationalLimitMotor(params.which);

    motor.set_m_loLimit(params.low_angle);
    motor.set_m_hiLimit(params.high_angle);
    motor.set_m_targetVelocity(params.velocity);
    motor.set_m_maxMotorForce(params.max_force);

    constraint.getRigidBodyA().activate();
    if (constraint.getRigidBodyB()) {
      constraint.getRigidBodyB().activate();
    }
  };
  public_functions.dof_disableAngularMotor = function (params) {
    var constraint = _constraints[params.constraint];

    var motor = constraint.getRotationalLimitMotor(params.which);
    motor.set_m_enableMotor(false);

    constraint.getRigidBodyA().activate();
    if (constraint.getRigidBodyB()) {
      constraint.getRigidBodyB().activate();
    }
  };

  reportWorld = function () {
    var index, object,
      transform, origin, rotation,
      offset = 0,
      i = 0;

    if (SUPPORT_TRANSFERABLE) {
      if (worldreport.length < 2 + _num_objects * WORLDREPORT_ITEMSIZE) {
        worldreport = new Float32Array(
          2 + // message id & # objects in report
          (Math.ceil(_num_objects / REPORT_CHUNKSIZE) * REPORT_CHUNKSIZE) * WORLDREPORT_ITEMSIZE // # of values needed * item size
        );
        worldreport[0] = MESSAGE_TYPES.WORLDREPORT;
      }
    }

    worldreport[1] = _num_objects; // record how many objects we're reporting on

    //for ( i = 0; i < worldreport[1]; i++ ) {
    for (index in _objects) {
      if (_objects.hasOwnProperty(index)) {
        object = _objects[index];

        // #TODO: we can't use center of mass transform when center of mass can change,
        //        but getMotionState().getWorldTransform() screws up on objects that have been moved
        //object.getMotionState().getWorldTransform( transform );
        transform = object.getCenterOfMassTransform();

        origin = transform.getOrigin();
        rotation = transform.getRotation();

        // add values to report
        offset = 2 + (i++) * WORLDREPORT_ITEMSIZE;

        worldreport[offset] = object.id;

        worldreport[offset + 1] = origin.x();
        worldreport[offset + 2] = origin.y();
        worldreport[offset + 3] = origin.z();

        worldreport[offset + 4] = rotation.x();
        worldreport[offset + 5] = rotation.y();
        worldreport[offset + 6] = rotation.z();
        worldreport[offset + 7] = rotation.w();

        _vector = object.getLinearVelocity();
        worldreport[offset + 8] = _vector.x();
        worldreport[offset + 9] = _vector.y();
        worldreport[offset + 10] = _vector.z();

        _vector = object.getAngularVelocity();
        worldreport[offset + 11] = _vector.x();
        worldreport[offset + 12] = _vector.y();
        worldreport[offset + 13] = _vector.z();
      }
    }


    if (SUPPORT_TRANSFERABLE) {
      transferableMessage(worldreport.buffer, [worldreport.buffer]);
    } else {
      transferableMessage(worldreport);
    }

  };

  reportCollisions = function () {
    var i, offset,
      dp = world.getDispatcher(),
      num = dp.getNumManifolds(),
      manifold, num_contacts, j, pt,
      _collided = false;

    if (SUPPORT_TRANSFERABLE) {
      if (collisionreport.length < 2 + num * COLLISIONREPORT_ITEMSIZE) {
        collisionreport = new Float32Array(
          2 + // message id & # objects in report
          (Math.ceil(_num_objects / REPORT_CHUNKSIZE) * REPORT_CHUNKSIZE) * COLLISIONREPORT_ITEMSIZE // # of values needed * item size
        );
        collisionreport[0] = MESSAGE_TYPES.COLLISIONREPORT;
      }
    }

    collisionreport[1] = 0; // how many collisions we're reporting on

    for (i = 0; i < num; i++) {
      manifold = dp.getManifoldByIndexInternal(i);

      num_contacts = manifold.getNumContacts();
      if (num_contacts === 0) {
        continue;
      }

      for (j = 0; j < num_contacts; j++) {
        pt = manifold.getContactPoint(j);
        //if ( pt.getDistance() < 0 ) {
        offset = 2 + (collisionreport[1]++) * COLLISIONREPORT_ITEMSIZE;
        collisionreport[offset] = _objects_ammo[manifold.getBody0()];
        collisionreport[offset + 1] = _objects_ammo[manifold.getBody1()];

        _vector = pt.get_m_normalWorldOnB();
        collisionreport[offset + 2] = _vector.x();
        collisionreport[offset + 3] = _vector.y();
        collisionreport[offset + 4] = _vector.z();
        break;
        //}

        transferableMessage(_objects_ammo);

      }
    }


    if (SUPPORT_TRANSFERABLE) {
      transferableMessage(collisionreport.buffer, [collisionreport.buffer]);
    } else {
      transferableMessage(collisionreport);
    }
  };

  reportVehicles = function () {
    var index, vehicle,
      transform, origin, rotation,
      offset = 0,
      i = 0, j = 0;

    if (SUPPORT_TRANSFERABLE) {
      if (vehiclereport.length < 2 + _num_wheels * VEHICLEREPORT_ITEMSIZE) {
        vehiclereport = new Float32Array(
          2 + // message id & # objects in report
          (Math.ceil(_num_wheels / REPORT_CHUNKSIZE) * REPORT_CHUNKSIZE) * VEHICLEREPORT_ITEMSIZE // # of values needed * item size
        );
        vehiclereport[0] = MESSAGE_TYPES.VEHICLEREPORT;
      }
    }

    for (index in _vehicles) {
      if (_vehicles.hasOwnProperty(index)) {
        vehicle = _vehicles[index];

        for (j = 0; j < vehicle.getNumWheels(); j++) {

          //vehicle.updateWheelTransform( j, true );

          //transform = vehicle.getWheelTransformWS( j );
          transform = vehicle.getWheelInfo(j).get_m_worldTransform();

          origin = transform.getOrigin();
          rotation = transform.getRotation();

          // add values to report
          offset = 1 + (i++) * VEHICLEREPORT_ITEMSIZE;

          vehiclereport[offset] = index;
          vehiclereport[offset + 1] = j;

          vehiclereport[offset + 2] = origin.x();
          vehiclereport[offset + 3] = origin.y();
          vehiclereport[offset + 4] = origin.z();

          vehiclereport[offset + 5] = rotation.x();
          vehiclereport[offset + 6] = rotation.y();
          vehiclereport[offset + 7] = rotation.z();
          vehiclereport[offset + 8] = rotation.w();

        }

      }
    }

    if (j !== 0) {
      if (SUPPORT_TRANSFERABLE) {
        transferableMessage(vehiclereport.buffer, [vehiclereport.buffer]);
      } else {
        transferableMessage(vehiclereport);
      }
    }
  };

  reportConstraints = function () {
    var index, constraint,
      offset_body,
      transform, origin,
      offset = 0,
      i = 0;

    if (SUPPORT_TRANSFERABLE) {
      if (constraintreport.length < 2 + _num_constraints * CONSTRAINTREPORT_ITEMSIZE) {
        constraintreport = new Float32Array(
          2 + // message id & # objects in report
          (Math.ceil(_num_constraints / REPORT_CHUNKSIZE) * REPORT_CHUNKSIZE) * CONSTRAINTREPORT_ITEMSIZE // # of values needed * item size
        );
        constraintreport[0] = MESSAGE_TYPES.CONSTRAINTREPORT;
      }
    }

    for (index in _constraints) {
      if (_constraints.hasOwnProperty(index)) {
        constraint = _constraints[index];
        offset_body = constraint.getRigidBodyA();
        transform = constraint.getFrameOffsetA();
        origin = transform.getOrigin();

        // add values to report
        offset = 1 + (i++) * CONSTRAINTREPORT_ITEMSIZE;

        constraintreport[offset] = index;
        constraintreport[offset + 1] = offset_body.id;
        constraintreport[offset + 2] = origin.getX();
        constraintreport[offset + 3] = origin.getY();
        constraintreport[offset + 4] = origin.getZ();
        constraintreport[offset + 5] = constraint.getAppliedImpulse();
      }
    }


    if (i !== 0) {
      if (SUPPORT_TRANSFERABLE) {
        transferableMessage(constraintreport.buffer, [constraintreport.buffer]);
      } else {
        transferableMessage(constraintreport);
      }
    }

  };

  self.onmessage = function (event) {

    if (event.data instanceof Float32Array) {
      // transferable object

      switch (event.data[0]) {
        case MESSAGE_TYPES.WORLDREPORT:
          worldreport = new Float32Array(event.data);
          break;

        case MESSAGE_TYPES.COLLISIONREPORT:
          collisionreport = new Float32Array(event.data);
          break;

        case MESSAGE_TYPES.VEHICLEREPORT:
          vehiclereport = new Float32Array(event.data);
          break;

        case MESSAGE_TYPES.CONSTRAINTREPORT:
          constraintreport = new Float32Array(event.data);
          break;
      }

      return;
    }

    if (event.data.cmd && public_functions[event.data.cmd]) {
      //if ( event.data.params.id !== undefined && _objects[event.data.params.id] === undefined && event.data.cmd !== 'addObject' && event.data.cmd !== 'registerMaterial' ) return;
      public_functions[event.data.cmd](event.data.params);
    }

  };

  window.Physijs = (function () {
    'use strict';

    var SUPPORT_TRANSFERABLE,
      _is_simulating = false,
      _Physijs = Physijs, // used for noConflict method
      Physijs = {}, // object assigned to window.Physijs
      Eventable, // class to provide simple event methods
      getObjectId, // returns a unique ID for a Physijs mesh object
      getEulerXYZFromQuaternion, getQuatertionFromEuler,
      convertWorldPositionToObject, // Converts a world-space position to object-space
      addObjectChildren,

      _temp1, _temp2,
      _temp_vector3_1 = new THREE.Vector3,
      _temp_vector3_2 = new THREE.Vector3,
      _temp_matrix4_1 = new THREE.Matrix4,
      _quaternion_1 = new THREE.Quaternion,

      // constants
      MESSAGE_TYPES = {
        WORLDREPORT: 0,
        COLLISIONREPORT: 1,
        VEHICLEREPORT: 2,
        CONSTRAINTREPORT: 3
      },
      REPORT_ITEMSIZE = 14,
      COLLISIONREPORT_ITEMSIZE = 5,
      VEHICLEREPORT_ITEMSIZE = 9,
      CONSTRAINTREPORT_ITEMSIZE = 6;

    Physijs.scripts = {};

    Eventable = function () {
      this._eventListeners = {};
    };
    Eventable.prototype.addEventListener = function (event_name, callback) {
      if (!this._eventListeners.hasOwnProperty(event_name)) {
        this._eventListeners[event_name] = [];
      }
      this._eventListeners[event_name].push(callback);
    };
    Eventable.prototype.removeEventListener = function (event_name, callback) {
      var index;

      if (!this._eventListeners.hasOwnProperty(event_name)) return false;

      if ((index = this._eventListeners[event_name].indexOf(callback)) >= 0) {
        this._eventListeners[event_name].splice(index, 1);
        return true;
      }

      return false;
    };
    Eventable.prototype.dispatchEvent = function (event_name) {
      var i,
        parameters = Array.prototype.splice.call(arguments, 1);

      if (this._eventListeners.hasOwnProperty(event_name)) {
        for (i = 0; i < this._eventListeners[event_name].length; i++) {
          this._eventListeners[event_name][i].apply(this, parameters);
        }
      }
    };
    Eventable.make = function (obj) {
      obj.prototype.addEventListener = Eventable.prototype.addEventListener;
      obj.prototype.removeEventListener = Eventable.prototype.removeEventListener;
      obj.prototype.dispatchEvent = Eventable.prototype.dispatchEvent;
    };

    getObjectId = (function () {
      var _id = 1;
      return function () {
        return _id++;
      };
    })();

    getEulerXYZFromQuaternion = function (x, y, z, w) {
      return new THREE.Vector3(
        Math.atan2(2 * (x * w - y * z), (w * w - x * x - y * y + z * z)),
        Math.asin(2 * (x * z + y * w)),
        Math.atan2(2 * (z * w - x * y), (w * w + x * x - y * y - z * z))
      );
    };

    getQuatertionFromEuler = function (x, y, z) {
      var c1, s1, c2, s2, c3, s3, c1c2, s1s2;
      c1 = Math.cos(y);
      s1 = Math.sin(y);
      c2 = Math.cos(-z);
      s2 = Math.sin(-z);
      c3 = Math.cos(x);
      s3 = Math.sin(x);

      c1c2 = c1 * c2;
      s1s2 = s1 * s2;

      return {
        w: c1c2 * c3 - s1s2 * s3,
        x: c1c2 * s3 + s1s2 * c3,
        y: s1 * c2 * c3 + c1 * s2 * s3,
        z: c1 * s2 * c3 - s1 * c2 * s3
      };
    };

    convertWorldPositionToObject = function (position, object) {
      _temp_matrix4_1.identity(); // reset temp matrix

      // Set the temp matrix's rotation to the object's rotation
      _temp_matrix4_1.identity().makeRotationFromQuaternion(object.quaternion);

      // Invert rotation matrix in order to "unrotate" a point back to object space
      _temp_matrix4_1.getInverse(_temp_matrix4_1);

      // Yay! Temp vars!
      _temp_vector3_1.copy(position);
      _temp_vector3_2.copy(object.position);

      // Apply the rotation

      return _temp_vector3_1.sub(_temp_vector3_2).applyMatrix4(_temp_matrix4_1);
    };



    // Physijs.noConflict
    Physijs.noConflict = function () {
      window.Physijs = _Physijs;
      return Physijs;
    };


    // Physijs.createMaterial
    Physijs.createMaterial = function (material, friction, restitution) {
      var physijs_material = function () { };
      physijs_material.prototype = material;
      physijs_material = new physijs_material;

      physijs_material._physijs = {
        id: material.id,
        friction: friction === undefined ? .8 : friction,
        restitution: restitution === undefined ? .2 : restitution
      };

      return physijs_material;
    };


    // Constraints
    Physijs.PointConstraint = function (objecta, objectb, position) {
      if (position === undefined) {
        position = objectb;
        objectb = undefined;
      }

      this.type = 'point';
      this.appliedImpulse = 0;
      this.id = getObjectId();
      this.objecta = objecta._physijs.id;
      this.positiona = convertWorldPositionToObject(position, objecta).clone();

      if (objectb) {
        this.objectb = objectb._physijs.id;
        this.positionb = convertWorldPositionToObject(position, objectb).clone();
      }
    };
    Physijs.PointConstraint.prototype.getDefinition = function () {
      return {
        type: this.type,
        id: this.id,
        objecta: this.objecta,
        objectb: this.objectb,
        positiona: this.positiona,
        positionb: this.positionb
      };
    };

    Physijs.HingeConstraint = function (objecta, objectb, position, axis) {
      if (axis === undefined) {
        axis = position;
        position = objectb;
        objectb = undefined;
      }

      this.type = 'hinge';
      this.appliedImpulse = 0;
      this.id = getObjectId();
      this.scene = objecta.parent;
      this.objecta = objecta._physijs.id;
      this.positiona = convertWorldPositionToObject(position, objecta).clone();
      this.position = position.clone();
      this.axis = axis;

      if (objectb) {
        this.objectb = objectb._physijs.id;
        this.positionb = convertWorldPositionToObject(position, objectb).clone();
      }
    };
    Physijs.HingeConstraint.prototype.getDefinition = function () {
      return {
        type: this.type,
        id: this.id,
        objecta: this.objecta,
        objectb: this.objectb,
        positiona: this.positiona,
        positionb: this.positionb,
        axis: this.axis
      };
    };
    /*
     * low = minimum angle in radians
     * high = maximum angle in radians
     * bias_factor = applied as a factor to constraint error
     * relaxation_factor = controls bounce (0.0 == no bounce)
     */
    Physijs.HingeConstraint.prototype.setLimits = function (low, high, bias_factor, relaxation_factor) {
      this.scene.execute('hinge_setLimits', { constraint: this.id, low: low, high: high, bias_factor: bias_factor, relaxation_factor: relaxation_factor });
    };
    Physijs.HingeConstraint.prototype.enableAngularMotor = function (velocity, acceleration) {
      this.scene.execute('hinge_enableAngularMotor', { constraint: this.id, velocity: velocity, acceleration: acceleration });
    };
    Physijs.HingeConstraint.prototype.disableMotor = function (velocity, acceleration) {
      this.scene.execute('hinge_disableMotor', { constraint: this.id });
    };

    Physijs.SliderConstraint = function (objecta, objectb, position, axis) {
      if (axis === undefined) {
        axis = position;
        position = objectb;
        objectb = undefined;
      }

      this.type = 'slider';
      this.appliedImpulse = 0;
      this.id = getObjectId();
      this.scene = objecta.parent;
      this.objecta = objecta._physijs.id;
      this.positiona = convertWorldPositionToObject(position, objecta).clone();
      this.axis = axis;

      if (objectb) {
        this.objectb = objectb._physijs.id;
        this.positionb = convertWorldPositionToObject(position, objectb).clone();
      }
    };
    Physijs.SliderConstraint.prototype.getDefinition = function () {
      return {
        type: this.type,
        id: this.id,
        objecta: this.objecta,
        objectb: this.objectb,
        positiona: this.positiona,
        positionb: this.positionb,
        axis: this.axis
      };
    };
    Physijs.SliderConstraint.prototype.setLimits = function (lin_lower, lin_upper, ang_lower, ang_upper) {
      this.scene.execute('slider_setLimits', { constraint: this.id, lin_lower: lin_lower, lin_upper: lin_upper, ang_lower: ang_lower, ang_upper: ang_upper });
    };
    Physijs.SliderConstraint.prototype.setRestitution = function (linear, angular) {
      this.scene.execute(
        'slider_setRestitution',
        {
          constraint: this.id,
          linear: linear,
          angular: angular
        }
      );
    };
    Physijs.SliderConstraint.prototype.enableLinearMotor = function (velocity, acceleration) {
      this.scene.execute('slider_enableLinearMotor', { constraint: this.id, velocity: velocity, acceleration: acceleration });
    };
    Physijs.SliderConstraint.prototype.disableLinearMotor = function () {
      this.scene.execute('slider_disableLinearMotor', { constraint: this.id });
    };
    Physijs.SliderConstraint.prototype.enableAngularMotor = function (velocity, acceleration) {
      this.scene.execute('slider_enableAngularMotor', { constraint: this.id, velocity: velocity, acceleration: acceleration });
    };
    Physijs.SliderConstraint.prototype.disableAngularMotor = function () {
      this.scene.execute('slider_disableAngularMotor', { constraint: this.id });
    };

    Physijs.ConeTwistConstraint = function (objecta, objectb, position) {
      if (position === undefined) {
        throw 'Both objects must be defined in a ConeTwistConstraint.';
      }
      this.type = 'conetwist';
      this.appliedImpulse = 0;
      this.id = getObjectId();
      this.scene = objecta.parent;
      this.objecta = objecta._physijs.id;
      this.positiona = convertWorldPositionToObject(position, objecta).clone();
      this.objectb = objectb._physijs.id;
      this.positionb = convertWorldPositionToObject(position, objectb).clone();
      this.axisa = { x: objecta.rotation.x, y: objecta.rotation.y, z: objecta.rotation.z };
      this.axisb = { x: objectb.rotation.x, y: objectb.rotation.y, z: objectb.rotation.z };
    };
    Physijs.ConeTwistConstraint.prototype.getDefinition = function () {
      return {
        type: this.type,
        id: this.id,
        objecta: this.objecta,
        objectb: this.objectb,
        positiona: this.positiona,
        positionb: this.positionb,
        axisa: this.axisa,
        axisb: this.axisb
      };
    };
    Physijs.ConeTwistConstraint.prototype.setLimit = function (x, y, z) {
      this.scene.execute('conetwist_setLimit', { constraint: this.id, x: x, y: y, z: z });
    };
    Physijs.ConeTwistConstraint.prototype.enableMotor = function () {
      this.scene.execute('conetwist_enableMotor', { constraint: this.id });
    };
    Physijs.ConeTwistConstraint.prototype.setMaxMotorImpulse = function (max_impulse) {
      this.scene.execute('conetwist_setMaxMotorImpulse', { constraint: this.id, max_impulse: max_impulse });
    };
    Physijs.ConeTwistConstraint.prototype.setMotorTarget = function (target) {
      if (target instanceof THREE.Vector3) {
        target = new THREE.Quaternion().setFromEuler(new THREE.Euler(target.x, target.y, target.z));
      } else if (target instanceof THREE.Euler) {
        target = new THREE.Quaternion().setFromEuler(target);
      } else if (target instanceof THREE.Matrix4) {
        target = new THREE.Quaternion().setFromRotationMatrix(target);
      }
      this.scene.execute('conetwist_setMotorTarget', { constraint: this.id, x: target.x, y: target.y, z: target.z, w: target.w });
    };
    Physijs.ConeTwistConstraint.prototype.disableMotor = function () {
      this.scene.execute('conetwist_disableMotor', { constraint: this.id });
    };

    Physijs.DOFConstraint = function (objecta, objectb, position) {
      if (position === undefined) {
        position = objectb;
        objectb = undefined;
      }
      this.type = 'dof';
      this.appliedImpulse = 0;
      this.id = getObjectId();
      this.scene = objecta.parent;
      this.objecta = objecta._physijs.id;
      this.positiona = convertWorldPositionToObject(position, objecta).clone();
      this.axisa = { x: objecta.rotation.x, y: objecta.rotation.y, z: objecta.rotation.z };

      if (objectb) {
        this.objectb = objectb._physijs.id;
        this.positionb = convertWorldPositionToObject(position, objectb).clone();
        this.axisb = { x: objectb.rotation.x, y: objectb.rotation.y, z: objectb.rotation.z };
      }
    };
    Physijs.DOFConstraint.prototype.getDefinition = function () {
      return {
        type: this.type,
        id: this.id,
        objecta: this.objecta,
        objectb: this.objectb,
        positiona: this.positiona,
        positionb: this.positionb,
        axisa: this.axisa,
        axisb: this.axisb
      };
    };
    Physijs.DOFConstraint.prototype.setLinearLowerLimit = function (limit) {
      this.scene.execute('dof_setLinearLowerLimit', { constraint: this.id, x: limit.x, y: limit.y, z: limit.z });
    };
    Physijs.DOFConstraint.prototype.setLinearUpperLimit = function (limit) {
      this.scene.execute('dof_setLinearUpperLimit', { constraint: this.id, x: limit.x, y: limit.y, z: limit.z });
    };
    Physijs.DOFConstraint.prototype.setAngularLowerLimit = function (limit) {
      this.scene.execute('dof_setAngularLowerLimit', { constraint: this.id, x: limit.x, y: limit.y, z: limit.z });
    };
    Physijs.DOFConstraint.prototype.setAngularUpperLimit = function (limit) {
      this.scene.execute('dof_setAngularUpperLimit', { constraint: this.id, x: limit.x, y: limit.y, z: limit.z });
    };
    Physijs.DOFConstraint.prototype.enableAngularMotor = function (which) {
      this.scene.execute('dof_enableAngularMotor', { constraint: this.id, which: which });
    };
    Physijs.DOFConstraint.prototype.configureAngularMotor = function (which, low_angle, high_angle, velocity, max_force) {
      this.scene.execute('dof_configureAngularMotor', { constraint: this.id, which: which, low_angle: low_angle, high_angle: high_angle, velocity: velocity, max_force: max_force });
    };
    Physijs.DOFConstraint.prototype.disableAngularMotor = function (which) {
      this.scene.execute('dof_disableAngularMotor', { constraint: this.id, which: which });
    };

    // Physijs.Scene
    Physijs.Scene = function (params) {
      var self = this;

      Eventable.call(this);
      THREE.Scene.call(this);

      this._worker = new Worker(Physijs.scripts.worker || 'physijs_worker.js');
      this._worker.transferableMessage = this._worker.webkitPostMessage || this._worker.postMessage;
      this._materials_ref_counts = {};
      this._objects = {};
      this._vehicles = {};
      this._constraints = {};

      var ab = new ArrayBuffer(1);
      this._worker.transferableMessage(ab, [ab]);
      SUPPORT_TRANSFERABLE = (ab.byteLength === 0);

      this._worker.onmessage = function (event) {
        var _temp,
          data = event.data;

        if (data instanceof ArrayBuffer && data.byteLength !== 1) { // byteLength === 1 is the worker making a SUPPORT_TRANSFERABLE test
          data = new Float32Array(data);
        }

        if (data instanceof Float32Array) {

          // transferable object
          switch (data[0]) {
            case MESSAGE_TYPES.WORLDREPORT:
              self._updateScene(data);
              break;

            case MESSAGE_TYPES.COLLISIONREPORT:
              self._updateCollisions(data);
              break;

            case MESSAGE_TYPES.VEHICLEREPORT:
              self._updateVehicles(data);
              break;

            case MESSAGE_TYPES.CONSTRAINTREPORT:
              self._updateConstraints(data);
              break;
          }

        } else {

          if (data.cmd) {

            // non-transferable object
            switch (data.cmd) {
              case 'objectReady':
                _temp = data.params;
                if (self._objects[_temp]) {
                  self._objects[_temp].dispatchEvent('ready');
                }
                break;

              case 'worldReady':
                self.dispatchEvent('ready');
                break;

              case 'vehicle':
                window.test = data;
                break;

              default:
                // Do nothing, just show the message
                console.debug('Received: ' + data.cmd);
                console.dir(data.params);
                break;
            }

          } else {

            switch (data[0]) {
              case MESSAGE_TYPES.WORLDREPORT:
                self._updateScene(data);
                break;

              case MESSAGE_TYPES.COLLISIONREPORT:
                self._updateCollisions(data);
                break;

              case MESSAGE_TYPES.VEHICLEREPORT:
                self._updateVehicles(data);
                break;

              case MESSAGE_TYPES.CONSTRAINTREPORT:
                self._updateConstraints(data);
                break;
            }

          }

        }
      };


      params = params || {};
      params.ammo = Physijs.scripts.ammo || 'ammo.js';
      params.fixedTimeStep = params.fixedTimeStep || 1 / 60;
      params.rateLimit = params.rateLimit || true;
      this.execute('init', params);
    };
    Physijs.Scene.prototype = new THREE.Scene;
    Physijs.Scene.prototype.constructor = Physijs.Scene;
    Eventable.make(Physijs.Scene);

    Physijs.Scene.prototype._updateScene = function (data) {
      var num_objects = data[1],
        object,
        i, offset;

      for (i = 0; i < num_objects; i++) {
        offset = 2 + i * REPORT_ITEMSIZE;
        object = this._objects[data[offset]];

        if (object === undefined) {
          continue;
        }

        if (object.__dirtyPosition === false) {
          object.position.set(
            data[offset + 1],
            data[offset + 2],
            data[offset + 3]
          );
        }

        if (object.__dirtyRotation === false) {
          object.quaternion.set(
            data[offset + 4],
            data[offset + 5],
            data[offset + 6],
            data[offset + 7]
          );
        }

        object._physijs.linearVelocity.set(
          data[offset + 8],
          data[offset + 9],
          data[offset + 10]
        );

        object._physijs.angularVelocity.set(
          data[offset + 11],
          data[offset + 12],
          data[offset + 13]
        );

      }

      if (SUPPORT_TRANSFERABLE) {
        // Give the typed array back to the worker
        this._worker.transferableMessage(data.buffer, [data.buffer]);
      }

      _is_simulating = false;
      this.dispatchEvent('update');
    };

    Physijs.Scene.prototype._updateVehicles = function (data) {
      var vehicle, wheel,
        i, offset;

      for (i = 0; i < (data.length - 1) / VEHICLEREPORT_ITEMSIZE; i++) {
        offset = 1 + i * VEHICLEREPORT_ITEMSIZE;
        vehicle = this._vehicles[data[offset]];

        if (vehicle === undefined) {
          continue;
        }

        wheel = vehicle.wheels[data[offset + 1]];

        wheel.position.set(
          data[offset + 2],
          data[offset + 3],
          data[offset + 4]
        );

        wheel.quaternion.set(
          data[offset + 5],
          data[offset + 6],
          data[offset + 7],
          data[offset + 8]
        );
      }

      if (SUPPORT_TRANSFERABLE) {
        // Give the typed array back to the worker
        this._worker.transferableMessage(data.buffer, [data.buffer]);
      }
    };

    Physijs.Scene.prototype._updateConstraints = function (data) {
      var constraint, object,
        i, offset;

      for (i = 0; i < (data.length - 1) / CONSTRAINTREPORT_ITEMSIZE; i++) {
        offset = 1 + i * CONSTRAINTREPORT_ITEMSIZE;
        constraint = this._constraints[data[offset]];
        object = this._objects[data[offset + 1]];

        if (constraint === undefined || object === undefined) {
          continue;
        }

        _temp_vector3_1.set(
          data[offset + 2],
          data[offset + 3],
          data[offset + 4]
        );
        _temp_matrix4_1.extractRotation(object.matrix);
        _temp_vector3_1.applyMatrix4(_temp_matrix4_1);

        constraint.positiona.addVectors(object.position, _temp_vector3_1);
        constraint.appliedImpulse = data[offset + 5];
      }

      if (SUPPORT_TRANSFERABLE) {
        // Give the typed array back to the worker
        this._worker.transferableMessage(data.buffer, [data.buffer]);
      }
    };

    Physijs.Scene.prototype._updateCollisions = function (data) {
      /**
       * #TODO
       * This is probably the worst way ever to handle collisions. The inherent evilness is a residual
       * effect from the previous version's evilness which mutated when switching to transferable objects.
       *
       * If you feel inclined to make this better, please do so.
       */

      var i, j, offset, object, object2, id1, id2,
        collisions = {}, normal_offsets = {};

      // Build collision manifest
      for (i = 0; i < data[1]; i++) {
        offset = 2 + i * COLLISIONREPORT_ITEMSIZE;
        object = data[offset];
        object2 = data[offset + 1];

        normal_offsets[object + '-' + object2] = offset + 2;
        normal_offsets[object2 + '-' + object] = -1 * (offset + 2);

        // Register collisions for both the object colliding and the object being collided with
        if (!collisions[object]) collisions[object] = [];
        collisions[object].push(object2);

        if (!collisions[object2]) collisions[object2] = [];
        collisions[object2].push(object);
      }

      // Deal with collisions
      for (id1 in this._objects) {
        if (!this._objects.hasOwnProperty(id1)) continue;
        object = this._objects[id1];

        // If object touches anything, ...
        if (collisions[id1]) {

          // Clean up touches array
          for (j = 0; j < object._physijs.touches.length; j++) {
            if (collisions[id1].indexOf(object._physijs.touches[j]) === -1) {
              object._physijs.touches.splice(j--, 1);
            }
          }

          // Handle each colliding object
          for (j = 0; j < collisions[id1].length; j++) {
            id2 = collisions[id1][j];
            object2 = this._objects[id2];

            if (object2) {
              // If object was not already touching object2, notify object
              if (object._physijs.touches.indexOf(id2) === -1) {
                object._physijs.touches.push(id2);

                _temp_vector3_1.subVectors(object.getLinearVelocity(), object2.getLinearVelocity());
                _temp1 = _temp_vector3_1.clone();

                _temp_vector3_1.subVectors(object.getAngularVelocity(), object2.getAngularVelocity());
                _temp2 = _temp_vector3_1.clone();

                var normal_offset = normal_offsets[object._physijs.id + '-' + object2._physijs.id];
                if (normal_offset > 0) {
                  _temp_vector3_1.set(
                    -data[normal_offset],
                    -data[normal_offset + 1],
                    -data[normal_offset + 2]
                  );
                } else {
                  normal_offset *= -1;
                  _temp_vector3_1.set(
                    data[normal_offset],
                    data[normal_offset + 1],
                    data[normal_offset + 2]
                  );
                }

                object.dispatchEvent('collision', object2, _temp1, _temp2, _temp_vector3_1);
              }
            }
          }

        } else {

          // not touching other objects
          object._physijs.touches.length = 0;

        }

      }

      this.collisions = collisions;

      if (SUPPORT_TRANSFERABLE) {
        // Give the typed array back to the worker
        this._worker.transferableMessage(data.buffer, [data.buffer]);
      }
    };

    Physijs.Scene.prototype.addConstraint = function (constraint, show_marker) {
      this._constraints[constraint.id] = constraint;
      this.execute('addConstraint', constraint.getDefinition());

      if (show_marker) {
        var marker;

        switch (constraint.type) {
          case 'point':
            marker = new THREE.Mesh(
              new THREE.SphereGeometry(1.5),
              new THREE.MeshNormalMaterial
            );
            marker.position.copy(constraint.positiona);
            this._objects[constraint.objecta].add(marker);
            break;

          case 'hinge':
            marker = new THREE.Mesh(
              new THREE.SphereGeometry(1.5),
              new THREE.MeshNormalMaterial
            );
            marker.position.copy(constraint.positiona);
            this._objects[constraint.objecta].add(marker);
            break;

          case 'slider':
            marker = new THREE.Mesh(
              new THREE.BoxGeometry(10, 1, 1),
              new THREE.MeshNormalMaterial
            );
            marker.position.copy(constraint.positiona);
            // This rotation isn't right if all three axis are non-0 values
            // TODO: change marker's rotation order to ZYX
            marker.rotation.set(
              constraint.axis.y, // yes, y and
              constraint.axis.x, // x axis are swapped
              constraint.axis.z
            );
            this._objects[constraint.objecta].add(marker);
            break;

          case 'conetwist':
            marker = new THREE.Mesh(
              new THREE.SphereGeometry(1.5),
              new THREE.MeshNormalMaterial
            );
            marker.position.copy(constraint.positiona);
            this._objects[constraint.objecta].add(marker);
            break;

          case 'dof':
            marker = new THREE.Mesh(
              new THREE.SphereGeometry(1.5),
              new THREE.MeshNormalMaterial
            );
            marker.position.copy(constraint.positiona);
            this._objects[constraint.objecta].add(marker);
            break;
        }
      }

      return constraint;
    };

    Physijs.Scene.prototype.onSimulationResume = function () {
      this.execute('onSimulationResume', {});
    };

    Physijs.Scene.prototype.removeConstraint = function (constraint) {
      if (this._constraints[constraint.id] !== undefined) {
        this.execute('removeConstraint', { id: constraint.id });
        delete this._constraints[constraint.id];
      }
    };

    Physijs.Scene.prototype.execute = function (cmd, params) {
      this._worker.postMessage({ cmd: cmd, params: params });
    };

    addObjectChildren = function (parent, object) {
      var i;

      for (i = 0; i < object.children.length; i++) {
        if (object.children[i]._physijs) {
          object.children[i].updateMatrix();
          object.children[i].updateMatrixWorld();

          _temp_vector3_1.setFromMatrixPosition(object.children[i].matrixWorld);
          _quaternion_1.setFromRotationMatrix(object.children[i].matrixWorld);

          object.children[i]._physijs.position_offset = {
            x: _temp_vector3_1.x,
            y: _temp_vector3_1.y,
            z: _temp_vector3_1.z
          };

          object.children[i]._physijs.rotation = {
            x: _quaternion_1.x,
            y: _quaternion_1.y,
            z: _quaternion_1.z,
            w: _quaternion_1.w
          };

          parent._physijs.children.push(object.children[i]._physijs);
        }

        addObjectChildren(parent, object.children[i]);
      }
    };

    Physijs.Scene.prototype.add = function (object) {
      THREE.Mesh.prototype.add.call(this, object);

      if (object._physijs) {

        object.world = this;

        if (object instanceof Physijs.Vehicle) {

          this.add(object.mesh);
          this._vehicles[object._physijs.id] = object;
          this.execute('addVehicle', object._physijs);

        } else {

          object.__dirtyPosition = false;
          object.__dirtyRotation = false;
          this._objects[object._physijs.id] = object;

          if (object.children.length) {
            object._physijs.children = [];
            addObjectChildren(object, object);
          }

          if (object.material._physijs) {
            if (!this._materials_ref_counts.hasOwnProperty(object.material._physijs.id)) {
              this.execute('registerMaterial', object.material._physijs);
              object._physijs.materialId = object.material._physijs.id;
              this._materials_ref_counts[object.material._physijs.id] = 1;
            } else {
              this._materials_ref_counts[object.material._physijs.id]++;
            }
          }

          // Object starting position + rotation
          object._physijs.position = { x: object.position.x, y: object.position.y, z: object.position.z };
          object._physijs.rotation = { x: object.quaternion.x, y: object.quaternion.y, z: object.quaternion.z, w: object.quaternion.w };

          // Check for scaling
          var mass_scaling = new THREE.Vector3(1, 1, 1);
          if (object._physijs.width) {
            object._physijs.width *= object.scale.x;
          }
          if (object._physijs.height) {
            object._physijs.height *= object.scale.y;
          }
          if (object._physijs.depth) {
            object._physijs.depth *= object.scale.z;
          }

          this.execute('addObject', object._physijs);

        }
      }
    };

    Physijs.Scene.prototype.remove = function (object) {
      if (object instanceof Physijs.Vehicle) {
        this.execute('removeVehicle', { id: object._physijs.id });
        while (object.wheels.length) {
          this.remove(object.wheels.pop());
        }
        this.remove(object.mesh);
        delete this._vehicles[object._physijs.id];
      } else {
        THREE.Mesh.prototype.remove.call(this, object);
        if (object._physijs) {
          delete this._objects[object._physijs.id];
          this.execute('removeObject', { id: object._physijs.id });
        }
      }
      if (object.material && object.material._physijs && this._materials_ref_counts.hasOwnProperty(object.material._physijs.id)) {
        this._materials_ref_counts[object.material._physijs.id]--;
        if (this._materials_ref_counts[object.material._physijs.id] == 0) {
          this.execute('unRegisterMaterial', object.material._physijs);
          delete this._materials_ref_counts[object.material._physijs.id];
        }
      }
    };

    Physijs.Scene.prototype.setFixedTimeStep = function (fixedTimeStep) {
      if (fixedTimeStep) {
        this.execute('setFixedTimeStep', fixedTimeStep);
      }
    };

    Physijs.Scene.prototype.setGravity = function (gravity) {
      if (gravity) {
        this.execute('setGravity', gravity);
      }
    };

    Physijs.Scene.prototype.simulate = function (timeStep, maxSubSteps) {
      var object_id, object, update;

      if (_is_simulating) {
        return false;
      }

      _is_simulating = true;

      for (object_id in this._objects) {
        if (!this._objects.hasOwnProperty(object_id)) continue;

        object = this._objects[object_id];

        if (object.__dirtyPosition || object.__dirtyRotation) {
          update = { id: object._physijs.id };

          if (object.__dirtyPosition) {
            update.pos = { x: object.position.x, y: object.position.y, z: object.position.z };
            object.__dirtyPosition = false;
          }

          if (object.__dirtyRotation) {
            update.quat = { x: object.quaternion.x, y: object.quaternion.y, z: object.quaternion.z, w: object.quaternion.w };
            object.__dirtyRotation = false;
          }

          this.execute('updateTransform', update);
        }
      }

      this.execute('simulate', { timeStep: timeStep, maxSubSteps: maxSubSteps });

      return true;
    };


    // Phsijs.Mesh
    Physijs.Mesh = function (geometry, material, mass) {
      var index;

      if (!geometry) {
        return;
      }

      Eventable.call(this);
      THREE.Mesh.call(this, geometry, material);

      if (!geometry.boundingBox) {
        geometry.computeBoundingBox();
      }

      this._physijs = {
        type: null,
        id: getObjectId(),
        mass: mass || 0,
        touches: [],
        linearVelocity: new THREE.Vector3,
        angularVelocity: new THREE.Vector3
      };
    };
    Physijs.Mesh.prototype = new THREE.Mesh;
    Physijs.Mesh.prototype.constructor = Physijs.Mesh;
    Eventable.make(Physijs.Mesh);

    // Physijs.Mesh.mass
    Physijs.Mesh.prototype.__defineGetter__('mass', function () {
      return this._physijs.mass;
    });
    Physijs.Mesh.prototype.__defineSetter__('mass', function (mass) {
      this._physijs.mass = mass;
      if (this.world) {
        this.world.execute('updateMass', { id: this._physijs.id, mass: mass });
      }
    });

    // Physijs.Mesh.applyCentralImpulse
    Physijs.Mesh.prototype.applyCentralImpulse = function (force) {
      if (this.world) {
        this.world.execute('applyCentralImpulse', { id: this._physijs.id, x: force.x, y: force.y, z: force.z });
      }
    };

    // Physijs.Mesh.applyImpulse
    Physijs.Mesh.prototype.applyImpulse = function (force, offset) {
      if (this.world) {
        this.world.execute('applyImpulse', { id: this._physijs.id, impulse_x: force.x, impulse_y: force.y, impulse_z: force.z, x: offset.x, y: offset.y, z: offset.z });
      }
    };

    // Physijs.Mesh.applyTorque
    Physijs.Mesh.prototype.applyTorque = function (force) {
      if (this.world) {
        this.world.execute('applyTorque', { id: this._physijs.id, torque_x: force.x, torque_y: force.y, torque_z: force.z });
      }
    };

    // Physijs.Mesh.applyCentralForce
    Physijs.Mesh.prototype.applyCentralForce = function (force) {
      if (this.world) {
        this.world.execute('applyCentralForce', { id: this._physijs.id, x: force.x, y: force.y, z: force.z });
      }
    };

    // Physijs.Mesh.applyForce
    Physijs.Mesh.prototype.applyForce = function (force, offset) {
      if (this.world) {
        this.world.execute('applyForce', { id: this._physijs.id, force_x: force.x, force_y: force.y, force_z: force.z, x: offset.x, y: offset.y, z: offset.z });
      }
    };

    // Physijs.Mesh.getAngularVelocity
    Physijs.Mesh.prototype.getAngularVelocity = function () {
      return this._physijs.angularVelocity;
    };

    // Physijs.Mesh.setAngularVelocity
    Physijs.Mesh.prototype.setAngularVelocity = function (velocity) {
      if (this.world) {
        this.world.execute('setAngularVelocity', { id: this._physijs.id, x: velocity.x, y: velocity.y, z: velocity.z });
      }
    };

    // Physijs.Mesh.getLinearVelocity
    Physijs.Mesh.prototype.getLinearVelocity = function () {
      return this._physijs.linearVelocity;
    };

    // Physijs.Mesh.setLinearVelocity
    Physijs.Mesh.prototype.setLinearVelocity = function (velocity) {
      if (this.world) {
        this.world.execute('setLinearVelocity', { id: this._physijs.id, x: velocity.x, y: velocity.y, z: velocity.z });
      }
    };

    // Physijs.Mesh.setAngularFactor
    Physijs.Mesh.prototype.setAngularFactor = function (factor) {
      if (this.world) {
        this.world.execute('setAngularFactor', { id: this._physijs.id, x: factor.x, y: factor.y, z: factor.z });
      }
    };

    // Physijs.Mesh.setLinearFactor
    Physijs.Mesh.prototype.setLinearFactor = function (factor) {
      if (this.world) {
        this.world.execute('setLinearFactor', { id: this._physijs.id, x: factor.x, y: factor.y, z: factor.z });
      }
    };

    // Physijs.Mesh.setDamping
    Physijs.Mesh.prototype.setDamping = function (linear, angular) {
      if (this.world) {
        this.world.execute('setDamping', { id: this._physijs.id, linear: linear, angular: angular });
      }
    };

    // Physijs.Mesh.setCcdMotionThreshold
    Physijs.Mesh.prototype.setCcdMotionThreshold = function (threshold) {
      if (this.world) {
        this.world.execute('setCcdMotionThreshold', { id: this._physijs.id, threshold: threshold });
      }
    };

    // Physijs.Mesh.setCcdSweptSphereRadius
    Physijs.Mesh.prototype.setCcdSweptSphereRadius = function (radius) {
      if (this.world) {
        this.world.execute('setCcdSweptSphereRadius', { id: this._physijs.id, radius: radius });
      }
    };


    // Physijs.PlaneMesh
    Physijs.PlaneMesh = function (geometry, material, mass) {
      var width, height;

      Physijs.Mesh.call(this, geometry, material, mass);

      if (!geometry.boundingBox) {
        geometry.computeBoundingBox();
      }

      width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;

      this._physijs.type = 'plane';
      this._physijs.normal = geometry.faces[0].normal.clone();
      this._physijs.mass = (typeof mass === 'undefined') ? width * height : mass;
    };
    Physijs.PlaneMesh.prototype = new Physijs.Mesh;
    Physijs.PlaneMesh.prototype.constructor = Physijs.PlaneMesh;

    // Physijs.HeightfieldMesh
    Physijs.HeightfieldMesh = function (geometry, material, mass, xdiv, ydiv) {
      Physijs.Mesh.call(this, geometry, material, mass);

      this._physijs.type = 'heightfield';
      this._physijs.xsize = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      this._physijs.ysize = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
      this._physijs.xpts = (typeof xdiv === 'undefined') ? Math.sqrt(geometry.vertices.length) : xdiv + 1;
      this._physijs.ypts = (typeof ydiv === 'undefined') ? Math.sqrt(geometry.vertices.length) : ydiv + 1;
      // note - this assumes our plane geometry is square, unless we pass in specific xdiv and ydiv
      this._physijs.absMaxHeight = Math.max(geometry.boundingBox.max.z, Math.abs(geometry.boundingBox.min.z));

      var points = [];

      var a, b;
      for (var i = 0; i < geometry.vertices.length; i++) {

        a = i % this._physijs.xpts;
        b = Math.round((i / this._physijs.xpts) - ((i % this._physijs.xpts) / this._physijs.xpts));
        points[i] = geometry.vertices[a + ((this._physijs.ypts - b - 1) * this._physijs.ypts)].z;

        //points[i] = geometry.vertices[i];
      }

      this._physijs.points = points;
    };
    Physijs.HeightfieldMesh.prototype = new Physijs.Mesh;
    Physijs.HeightfieldMesh.prototype.constructor = Physijs.HeightfieldMesh;

    // Physijs.BoxMesh
    Physijs.BoxMesh = function (geometry, material, mass) {
      var width, height, depth;

      Physijs.Mesh.call(this, geometry, material, mass);

      if (!geometry.boundingBox) {
        geometry.computeBoundingBox();
      }

      width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
      depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

      this._physijs.type = 'box';
      this._physijs.width = width;
      this._physijs.height = height;
      this._physijs.depth = depth;
      this._physijs.mass = (typeof mass === 'undefined') ? width * height * depth : mass;
    };
    Physijs.BoxMesh.prototype = new Physijs.Mesh;
    Physijs.BoxMesh.prototype.constructor = Physijs.BoxMesh;


    // Physijs.SphereMesh
    Physijs.SphereMesh = function (geometry, material, mass) {
      Physijs.Mesh.call(this, geometry, material, mass);

      if (!geometry.boundingSphere) {
        geometry.computeBoundingSphere();
      }

      this._physijs.type = 'sphere';
      this._physijs.radius = geometry.boundingSphere.radius;
      this._physijs.mass = (typeof mass === 'undefined') ? (4 / 3) * Math.PI * Math.pow(this._physijs.radius, 3) : mass;
    };
    Physijs.SphereMesh.prototype = new Physijs.Mesh;
    Physijs.SphereMesh.prototype.constructor = Physijs.SphereMesh;


    // Physijs.CylinderMesh
    Physijs.CylinderMesh = function (geometry, material, mass) {
      var width, height, depth;

      Physijs.Mesh.call(this, geometry, material, mass);

      if (!geometry.boundingBox) {
        geometry.computeBoundingBox();
      }

      width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
      depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

      this._physijs.type = 'cylinder';
      this._physijs.width = width;
      this._physijs.height = height;
      this._physijs.depth = depth;
      this._physijs.mass = (typeof mass === 'undefined') ? width * height * depth : mass;
    };
    Physijs.CylinderMesh.prototype = new Physijs.Mesh;
    Physijs.CylinderMesh.prototype.constructor = Physijs.CylinderMesh;


    // Physijs.CapsuleMesh
    Physijs.CapsuleMesh = function (geometry, material, mass) {
      var width, height, depth;

      Physijs.Mesh.call(this, geometry, material, mass);

      if (!geometry.boundingBox) {
        geometry.computeBoundingBox();
      }

      width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
      depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

      this._physijs.type = 'capsule';
      this._physijs.radius = Math.max(width / 2, depth / 2);
      this._physijs.height = height;
      this._physijs.mass = (typeof mass === 'undefined') ? width * height * depth : mass;
    };
    Physijs.CapsuleMesh.prototype = new Physijs.Mesh;
    Physijs.CapsuleMesh.prototype.constructor = Physijs.CapsuleMesh;


    // Physijs.ConeMesh
    Physijs.ConeMesh = function (geometry, material, mass) {
      var width, height, depth;

      Physijs.Mesh.call(this, geometry, material, mass);

      if (!geometry.boundingBox) {
        geometry.computeBoundingBox();
      }

      width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;

      this._physijs.type = 'cone';
      this._physijs.radius = width / 2;
      this._physijs.height = height;
      this._physijs.mass = (typeof mass === 'undefined') ? width * height : mass;
    };
    Physijs.ConeMesh.prototype = new Physijs.Mesh;
    Physijs.ConeMesh.prototype.constructor = Physijs.ConeMesh;


    // Physijs.ConcaveMesh
    Physijs.ConcaveMesh = function (geometry, material, mass) {
      var i,
        width, height, depth,
        vertices, face, triangles = [];

      Physijs.Mesh.call(this, geometry, material, mass);

      if (!geometry.boundingBox) {
        geometry.computeBoundingBox();
      }

      vertices = geometry.vertices;

      for (i = 0; i < geometry.faces.length; i++) {
        face = geometry.faces[i];
        if (face instanceof THREE.Face3) {

          triangles.push([
            { x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
            { x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
            { x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z }
          ]);

        } else if (face instanceof THREE.Face4) {

          triangles.push([
            { x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
            { x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
            { x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z }
          ]);
          triangles.push([
            { x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
            { x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z },
            { x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z }
          ]);

        }
      }

      width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
      depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

      this._physijs.type = 'concave';
      this._physijs.triangles = triangles;
      this._physijs.mass = (typeof mass === 'undefined') ? width * height * depth : mass;
    };
    Physijs.ConcaveMesh.prototype = new Physijs.Mesh;
    Physijs.ConcaveMesh.prototype.constructor = Physijs.ConcaveMesh;


    // Physijs.ConvexMesh
    Physijs.ConvexMesh = function (geometry, material, mass) {
      var i,
        width, height, depth,
        points = [];

      Physijs.Mesh.call(this, geometry, material, mass);

      if (!geometry.boundingBox) {
        geometry.computeBoundingBox();
      }

      for (i = 0; i < geometry.vertices.length; i++) {
        points.push({
          x: geometry.vertices[i].x,
          y: geometry.vertices[i].y,
          z: geometry.vertices[i].z
        });
      }


      width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
      depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

      this._physijs.type = 'convex';
      this._physijs.points = points;
      this._physijs.mass = (typeof mass === 'undefined') ? width * height * depth : mass;
    };
    Physijs.ConvexMesh.prototype = new Physijs.Mesh;
    Physijs.ConvexMesh.prototype.constructor = Physijs.ConvexMesh;


    // Physijs.Vehicle
    Physijs.Vehicle = function (mesh, tuning) {
      tuning = tuning || new Physijs.VehicleTuning;
      this.mesh = mesh;
      this.wheels = [];
      this._physijs = {
        id: getObjectId(),
        rigidBody: mesh._physijs.id,
        suspension_stiffness: tuning.suspension_stiffness,
        suspension_compression: tuning.suspension_compression,
        suspension_damping: tuning.suspension_damping,
        max_suspension_travel: tuning.max_suspension_travel,
        friction_slip: tuning.friction_slip,
        max_suspension_force: tuning.max_suspension_force
      };
    };
    Physijs.Vehicle.prototype.addWheel = function (wheel_geometry, wheel_material, connection_point, wheel_direction, wheel_axle, suspension_rest_length, wheel_radius, is_front_wheel, tuning) {
      var wheel = new THREE.Mesh(wheel_geometry, wheel_material);
      wheel.castShadow = wheel.receiveShadow = true;
      wheel.position.copy(wheel_direction).multiplyScalar(suspension_rest_length / 100).add(connection_point);
      this.world.add(wheel);
      this.wheels.push(wheel);

      this.world.execute('addWheel', {
        id: this._physijs.id,
        connection_point: { x: connection_point.x, y: connection_point.y, z: connection_point.z },
        wheel_direction: { x: wheel_direction.x, y: wheel_direction.y, z: wheel_direction.z },
        wheel_axle: { x: wheel_axle.x, y: wheel_axle.y, z: wheel_axle.z },
        suspension_rest_length: suspension_rest_length,
        wheel_radius: wheel_radius,
        is_front_wheel: is_front_wheel,
        tuning: tuning
      });
    };
    Physijs.Vehicle.prototype.setSteering = function (amount, wheel) {
      if (wheel !== undefined && this.wheels[wheel] !== undefined) {
        this.world.execute('setSteering', { id: this._physijs.id, wheel: wheel, steering: amount });
      } else if (this.wheels.length > 0) {
        for (var i = 0; i < this.wheels.length; i++) {
          this.world.execute('setSteering', { id: this._physijs.id, wheel: i, steering: amount });
        }
      }
    };
    Physijs.Vehicle.prototype.setBrake = function (amount, wheel) {
      if (wheel !== undefined && this.wheels[wheel] !== undefined) {
        this.world.execute('setBrake', { id: this._physijs.id, wheel: wheel, brake: amount });
      } else if (this.wheels.length > 0) {
        for (var i = 0; i < this.wheels.length; i++) {
          this.world.execute('setBrake', { id: this._physijs.id, wheel: i, brake: amount });
        }
      }
    };
    Physijs.Vehicle.prototype.applyEngineForce = function (amount, wheel) {
      if (wheel !== undefined && this.wheels[wheel] !== undefined) {
        this.world.execute('applyEngineForce', { id: this._physijs.id, wheel: wheel, force: amount });
      } else if (this.wheels.length > 0) {
        for (var i = 0; i < this.wheels.length; i++) {
          this.world.execute('applyEngineForce', { id: this._physijs.id, wheel: i, force: amount });
        }
      }
    };

    // Physijs.VehicleTuning
    Physijs.VehicleTuning = function (suspension_stiffness, suspension_compression, suspension_damping, max_suspension_travel, friction_slip, max_suspension_force) {
      this.suspension_stiffness = suspension_stiffness !== undefined ? suspension_stiffness : 5.88;
      this.suspension_compression = suspension_compression !== undefined ? suspension_compression : 0.83;
      this.suspension_damping = suspension_damping !== undefined ? suspension_damping : 0.88;
      this.max_suspension_travel = max_suspension_travel !== undefined ? max_suspension_travel : 500;
      this.friction_slip = friction_slip !== undefined ? friction_slip : 10.5;
      this.max_suspension_force = max_suspension_force !== undefined ? max_suspension_force : 6000;
    };

    return Physijs;
  })();

  //!bullets.js
  function Bullets() {
    self = this;
  }

  //PLAYER1
  Bullets.prototype.fire = (playerSpeed) => {


    let bulletsLBlockGeometry = new THREE.SphereGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
    let bulletsLBlockMaterial = new THREE.MeshLambertMaterial({ color: 0xff00C2 }); //COLOR OF MESH
    bulletsLBlock = new Physijs.BoxMesh(bulletsLBlockGeometry, bulletsLBlockMaterial); //MESH POINTS MAT TO GEOMETRY
    // console.log((player.rotation.y/ Math.PI) * 2);

    let wpVector2 = new THREE.Vector3();
    bulletsLBlock.name = 'bullet'
    bulletsLBlock.position.set(player.position.x + -8 * player.getWorldDirection(wpVector2).x, player.position.y, player.position.z - 8 * player.getWorldDirection(wpVector2).z);
    // bulletsLBlock.rotation.set(-rotateAngle);

    bulletsLBlock.createdAt = clock.getElapsedTime();
    // debugger

    scene.add(bulletsLBlock)

    bulletsLBlock.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
      if (other_object.name === 'ground' || other_object.name === 'floorBlock' || other_object.name === 'target' || other_object.name === 'player2') {
        let selectedObject = scene.getObjectByName('bullet');
        if (selectedObject) {
          console.log(other_object.name)

          scene.remove(selectedObject);
        }

        if (other_object.name === 'player2') {
          winner = document.getElementById('winner');
          if (other_object.hp > 0) {
            other_object.hp -= 1;
          }
          opponent = document.getElementById('opponent')
          opponent.innerHTML = `Opponent HP: ${other_object.hp}`;
          if (other_object.hp <= 0) {
            winner.innerHTML = 'You win!'
          }
        }
      }
      // env3Block.visible = false; // make any mesh disappear on collision...
    });

  }

  //Player 2 fire
  Bullets.prototype.p2fire = (playerSpeed) => {

    //PLAYER2
    let p2BulletsBlockGeometry = new THREE.SphereGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
    let p2BulletsBlockMaterial = new THREE.MeshLambertMaterial({ color: 0xff00C2 }); //COLOR OF MESH
    p2BulletsBlock = new Physijs.BoxMesh(p2BulletsBlockGeometry, p2BulletsBlockMaterial); //MESH POINTS MAT TO GEOMETRY
    // console.log((player.rotation.y/ Math.PI) * 2);


    let wpVector = new THREE.Vector3();
    p2BulletsBlock.name = 'bullet'
    p2BulletsBlock.position.set(player2.position.x + -8 * player2.getWorldDirection(wpVector).x, player2.position.y, player2.position.z - 8 * player2.getWorldDirection(wpVector).z);
    // p2BulletsBlock.rotation.set(-rotateAngle);

    p2BulletsBlock.createdAt = clock.getElapsedTime();
    // debugger

    scene.add(p2BulletsBlock)


    p2BulletsBlock.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
      // console.log(other_object)
      // console.log(linear_velocity)
      // console.log(angular_velocity)
      // env3Block.material.wireframe = true
      if (other_object.name === 'ground' || other_object.name === 'floorBlock' || other_object.name === 'target' || other_object.name === 'player2') {
        let selectedObject = scene.getObjectByName('bullet');
        if (selectedObject) {
          console.log(other_object.name)

          scene.remove(selectedObject);
        }

        if (other_object.name === 'player1') {
          winner = document.getElementById('winner');
          if (other_object.hp > 0) {
            other_object.hp -= 1;
          }
          opponent = document.getElementById('opponent')
          opponent.innerHTML = `Opponent HP: ${other_object.hp}`;
          if (other_object.hp <= 0) {
            winner.innerHTML = 'You win!'
          }
        }
      }
      // env3Block.visible = false; // make any mesh disappear on collision...
    });

  }
  //!bullets.js

  //!input.js
  function Input() {
    self = this;

    //Set initial state of Input class
    self.isLeftPressed = false;
    self.isRightPressed = false;
    self.isFwdPressed = false;
    self.isBwdPressed = false;
    self.isShiftPressed = false;
    self.isRLPressed = false;
    self.isRRPressed = false;
    //how do we add gravity?
    self.isSpacePressed = false;
    //bullets?
    self.isFirePressed = false;
    self.isXPressed = false;

    //Handle key events (setting value according to event listener)
    const handleKeyEvent = (e, isKeyDown) => {
      if (e.keyCode === 65) {
        self.isLeftPressed = isKeyDown;
      }
      if (e.keyCode === 68) {
        self.isRightPressed = isKeyDown;
      }
      if (e.keyCode === 32) {
        self.isSpacePressed = isKeyDown;
      }
      if (e.keyCode === 87) {
        self.isFwdPressed = isKeyDown;
      }
      if (e.keyCode === 83) {
        self.isBwdPressed = isKeyDown;
      }
      if (e.keyCode === 16) {
        self.isShiftPressed = isKeyDown;
      }
      if (e.keyCode === 81) {
        self.isRLPressed = isKeyDown;
      }
      if (e.keyCode === 69) {
        self.isRRPressed = isKeyDown;
      }
      if (e.keyCode === 74) {
        self.isFirePressed = isKeyDown;
      }
      if (e.keyCode === 75) {
        self.isXPressed = isKeyDown;
      }
    }

    //Event listeners for key input, pass event and bool to handle event
    document.addEventListener("keydown", (e) => { handleKeyEvent(e, true) })
    document.addEventListener("keyup", (e) => { handleKeyEvent(e, false) })
  }
  //!input.js

  //!environment.js
  function Environment() {

    //TERRAIN TEXTURES
    var Tmaterial = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture('../assets/jotunheimen-texture.jpg')
    });

    //TERRAIN
    var terrainLoader = new THREE.TerrainLoader();
    terrainLoader.load('../assets/jotunheimen.bin', function (data) {
      var geometry = new THREE.PlaneGeometry(60, 60, 199, 199);
      for (var i = 0, l = geometry.vertices.length; i < l; i++) {
        geometry.vertices[i].z = data[i] / 65535 * 10;
      }
      // var material = new THREE.MeshPhongMaterial({
      //   color: 0xdddddd,
      // wireframe: true
      // });
      var plane = new Physijs.PlaneMesh(geometry, Tmaterial, 0, 0);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -120;
      plane.scale.set(12, 12, 12)
      scene.add(plane);
    });

    //CubeMap
    // var loader = new THREE.CubeTextureLoader();
    // loader.setPath('textures/cube/pisa/');

    // var textureCube = loader.load([
    //   'px.png', 'nx.png',
    //   'py.png', 'ny.png',
    //   'pz.png', 'nz.png'
    // ]);

    // var material = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: textureCube });
    // let sceneCube = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), material);
    // scene.add(sceneCube);



    // const loader = new THREE.CubeTextureLoader();
    // const texture2 = loader.load([
    //   'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-x.jpg',
    //   'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-x.jpg',
    //   'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-y.jpg',
    //   'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-y.jpg',
    //   'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-z.jpg',
    //   'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-z.jpg',
    // ]);
    // scene.background = texture2;

    const loader = new THREE.CubeTextureLoader();
    const texture2 = loader.load([
      './textures/c2/px.png',
      './textures/c2/nx.png',
      './textures/c2/py.png',
      './textures/c2/ny.png',
      './textures/c2/pz.png',
      './textures/c2/nz.png',
    ]);
    scene.background = texture2;



    //Texture loader

    const textureLoader = new THREE.TextureLoader();

    const texture = textureLoader.load('textures/dirt.png');

    texture.encoding = THREE.sRGBEncoding;

    texture.anisotropy = 16;

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(200, 200);

    // debugger
    const materialMap = new THREE.MeshStandardMaterial({
      map: texture,
    });

    //TARGET TEXTURE

    const Targettexture = textureLoader.load('textures/tron1.jpg');

    Targettexture.encoding = THREE.sRGBEncoding;

    Targettexture.anisotropy = 16;

    Targettexture.wrapS = Targettexture.wrapT = THREE.RepeatWrapping;
    Targettexture.offset.set(0, 0);
    Targettexture.repeat.set(200, 200);

    // debugger
    const TargetMaterialMap = new THREE.MeshStandardMaterial({
      map: Targettexture,
    });

    //GROUND
    let groundGeometry = new THREE.PlaneGeometry(1000, 1000, 0); //PRIMITIVE SHAPE AND SIZE
    let groundMaterial = new THREE.MeshBasicMaterial({ color: 'black', visible: false }); //COLOR OF MESH
    // let ground = new THREE.Mesh(groundGeometry, groundMaterial); //MESH POINTS MAT TO GEOMETRY


    var friction = 0.8; // high friction
    var restitution = 0.3; // low restitution

    // var material = Physijs.createMaterial(
    //   new THREE.MeshBasicMaterial({ color: 0x888888 }),
    //   friction,
    //   restitution,
    // );

    let ground = new Physijs.PlaneMesh(groundGeometry, groundMaterial, 0, 0); //MESH POINTS MAT TO GEOMETRY
    ground.rotation.x = -0.5 * Math.PI;
    ground.name = 'ground'
    ground.receiveShadow = true;
    scene.add(ground); //DROP ELEMENT INTO VIRTUAL ENVIRONMENT

    // // 07c
    // // ELEMENT ONE (**LOOK UP MATERIAL OPTIONS**)
    // for (let i = 0; i < 100; i++) {
    //   let env2BlockGeometry = new THREE.BoxBufferGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
    //   let env2BlockMaterial = new THREE.MeshLambertMaterial({ color: 0x22CAC2 }); //COLOR OF MESH
    //   let env2Block = new THREE.Mesh(env2BlockGeometry, env2BlockMaterial); //MESH POINTS MAT TO GEOMETRY
    //   env2Block.position.x = (Math.random() - 0.5) * 400;
    //   env2Block.position.y = (Math.random() - 0.5) * 400;
    //   env2Block.position.z = (Math.random() - 0.5) * 300;
    //   // scene.add(env2Block); //DROP ELEMENT INTO VIRTUAL ENVIRONMENT
    // }

    _vector = new THREE.Vector3(0, 0, 0)
    for (let i = 0; i < 200; i++) {
      let env3BlockGeometry = new THREE.BoxBufferGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
      let env3BlockMaterial = new THREE.MeshLambertMaterial({ color: 0xff00C2 }); //COLOR OF MESH
      let env3Block = new Physijs.BoxMesh(env3BlockGeometry, env3BlockMaterial); //MESH POINTS MAT TO GEOMETRY
      env3Block.position.x = (Math.random() - 0.5) * 300;
      env3Block.position.y = 1
      env3Block.position.z = (Math.random() - 0.5) * 300;
      // debugger//
      env3Block.scale.set(2, 2, 2)
      env3Block.name = 'floorBlock'
      // scene.add(env3Block); //DROP ELEMENST INTO VIRTUAL ENVIRONMENT

      env3Block.setAngularFactor(_vector);
      env3Block.setAngularVelocity(_vector);

      env3Block.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
        if (other_object.name === 'bullet') {
          // player.points += 1;
          // let pointEle = document.getElementById('points')
          // pointEle.innerHTML = `Score: ${player.points}`
          env3Block.visible = false;
        }
      });
    }

    _vector = new THREE.Vector3(0, 0, 0)
    for (let i = 0; i < 100; i++) {

      let color;
      if (i % 2 === 0) {
        color = 0xfffff;
        rot = Math.PI / 2
        point = 100;
        scale = 1;
      } else {
        color = 0xb52626;
        rot = 0;
        point = 1000
        scale = .5;
      }

      let TargetBlockGeometry = new THREE.CylinderBufferGeometry(scale, scale, 1, 100); //PRIMITIVE SHAPE AND SIZE
      // let TargetBlockMaterial = new THREE.MeshLambertMaterial({ color: color }); //COLOR OF MESH
      let TargetBlockMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: scene.background }); //COLOR OF MESH

      let TargetBlock = new Physijs.BoxMesh(TargetBlockGeometry, TargetBlockMaterial, 0, 0); //MESH POINTS MAT TO GEOMETRY
      TargetBlock.position.x = (Math.random() - 0.5) * 300;
      TargetBlock.position.y = (Math.random() - 0.5) * 300 + 200;
      TargetBlock.position.z = (Math.random() - 0.5) * 300;
      TargetBlock.rotation.x = Math.PI / 2;
      TargetBlock.rotation.z = rot;
      // debugger//
      TargetBlock.scale.set(10, 1, 10)
      TargetBlock.name = 'target'
      TargetBlock.points = point;
      scene.add(TargetBlock); //DROP ELEMENST INTO VIRTUAL ENVIRONMENT

      TargetBlock.setAngularFactor(_vector);
      TargetBlock.setAngularVelocity(_vector);

      TargetBlock.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
        if (other_object.name === 'bullet') {
          // player.points += this.points;
          let pointEle = document.getElementById('points')
          // pointEle.innerHTML = `Score: ${player.points}`
          // TargetBlock.visible = false;
          scene.remove(this);
        }
      });
    }

    for (let i = 0; i < 200; i++) {
      // let BIGheight = (Math.random() - 0.5) * 10;
      let BIGheight = 1;
      let Trunkheight = 2.125
      let env1BIGBlockGeometry = new THREE.BoxBufferGeometry(1, BIGheight, 1); //PRIMITIVE SHAPE AND SIZE
      let env1BIGBlockMaterial = new THREE.MeshLambertMaterial({ color: 0x6bff42 }); //COLOR OF MESH
      let env1BIGBlock = new Physijs.BoxMesh(env1BIGBlockGeometry, env1BIGBlockMaterial, 0); //MESH POINTS MAT TO GEOMETRY
      let env1TrunkBlockGeometry = new THREE.BoxBufferGeometry(.25, Trunkheight, .25, 1); //PRIMITIVE SHAPE AND SIZE
      let env1TrunkBlockMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff }); //COLOR OF MESH
      let env1TrunkBlock = new Physijs.BoxMesh(env1TrunkBlockGeometry, env1TrunkBlockMaterial, 0); //MESH POINTS MAT TO GEOMETRY

      env1TrunkBlock.position.x = env1BIGBlock.position.x;
      env1TrunkBlock.position.y = 1
      env1TrunkBlock.position.z = env1BIGBlock.position.z;

      env1BIGBlock.add(env1TrunkBlock)
      env1BIGBlock.hp = 100;
      env1BIGBlock.rotation.x = Math.PI

      env1BIGBlock.position.x = (Math.random() - 0.5) * 600;
      env1BIGBlock.position.y = 40
      env1BIGBlock.position.z = (Math.random() - 0.5) * 600;


      // debugger
      env1BIGBlock.scale.set(20, 20, 20)
      env1BIGBlock.name = 'floorBlock'
      env1TrunkBlock.name = 'floorBlock'

      // scene.add(env1BIGBlock); //DROP ELEMENT INTO VIRTUAL ENVIRONMENT
      // scene.add(env1TrunkBlock); //DROP ELEMENT INTO VIRTUAL ENVIRONMENT

      env1BIGBlock.setAngularFactor(_vector);
      env1BIGBlock.setAngularVelocity(_vector);

      env1BIGBlock.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
        if (other_object.name === 'bullet') {
          env1BIGBlock.hp -= 1;
          if (env1BIGBlock.hp === 0) {
            // player.points += 100;
            let pointEle = document.getElementById('points')
            pointEle.innerHTML = `Score: ${player.points}`
            scene.remove(this)
            // env1BIGBlock.visible = false;
          }
        }
      });

      env1TrunkBlock.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
        if (other_object.name === 'bullet') {
          env1BIGBlock.hp -= 1;
          if (env1BIGBlock.hp === 0) {
            // player.points += 10;
            let pointEle = document.getElementById('points')
            pointEle.innerHTML = `Score: ${player.points}`
            env1BIGBlock.visible = false;
          }
        }
      });
    }

    const towerRow = (height, width, zPos) => {
      for (let i = 0; i < width; i++) {
        let env4BlockGeometry = new THREE.BoxBufferGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
        var env4BlockMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: 0xff00C2 }), 0, .1)
        // let env4BlockMaterial = new THREE.MeshLambertMaterial({ color: 0xff00C2 }); //COLOR OF MESH
        let env4Block = new Physijs.BoxMesh(env4BlockGeometry, env4BlockMaterial); //MESH POINTS MAT TO GEOMETRY

        env4Block.position.x = i * 2.1 + 6;
        env4Block.position.y = height;
        env4Block.position.z = zPos;
        // debugger
        env4Block.scale.set(2, 2, 2)
        env4Block.name = 'floorBlock'
        scene.add(env4Block); //DROP ELEMENT INTO VIRTUAL ENVIRONMENT

        env4Block.setAngularFactor(_vector);
        env4Block.setAngularVelocity(_vector);

        env4Block.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
          if (other_object.name === 'bullet') {
            // player.points += 1;
            let pointEle = document.getElementById('points')
            pointEle.innerHTML = `Score: ${player.points}`
            // env4Block.visible = false;
            scene.remove(this)
          }
        });
      }
    }


    const towerBuilder = (numRows) => {
      zPos = (Math.random() - 0.5) * 300;
      width = 1;
      for (let i = 0; i < numRows; i++) {
        towerRow((i * 2 + 1), width, zPos)
      }
    }

    for (let i = 0; i < 0; i++) {
      towerBuilder(20)
    }

  }

  //!environment.js

  //!fileUploader.js
  let MechLoader = new THREE.OBJLoader();
  MechLoader.load(
    'assets/mech.obj',
    function (object) {
      mechMesh = object.children[0]
      mechMesh.position.set(0, -4, 0);
      mechMesh.rotation.y = Math.PI;

      let materials = mechMesh.material
      for (let i = 0; i < materials.length; i++) {
        if (i % 2 === 0) {
          // mechMesh.material[i].color.set(0x2f523e);
          mechMesh.material[i].envMap = scene.background
        } else {
          mechMesh.material[i].color.set(0xf5d742);
        }
      }
      player.points2 = 0;
      player.position.set(0, 10, 0);
      // player.material.wireframe = true;

      player.add(mechMesh)
      player.position.set(1, 4, 0)

      let mechMesh2 = mechMesh.clone();
      player2.add(mechMesh2)
      player2.name = 'player2';

      let lightPlayer = new THREE.DirectionalLight(0xFFFFFF, 1);
      lightPlayer.position.set(0, 200, 0)
      lightPlayer.target = player;
      player.hp = 20;
      scene.add(lightPlayer)
      scene.add(lightPlayer.target);

      scene.add(player)
      scene.add(player2)

      //RADAR
      let radarGeometry = new THREE.SphereGeometry(2, 20, 20);
      let radarMaterial = new THREE.MeshLambertMaterial({
        color: 0x22CAC2,
        opacity: 0.5,
        transparent: true,
        wireframe: true,
      })

      radar = new THREE.Mesh(radarGeometry, radarMaterial); //MESH POINTS MAT TO GEOMETRY
      radar.position.set(7, 8, 0);
      player.add(radar);

      //P1 RADAR
      // let p1radarGeometry = new THREE.SphereGeometry(.2, 1, 1);
      let p1radarGeometry = new THREE.ConeBufferGeometry(.1, .5, 4);
      let p1radarMaterial = new THREE.MeshLambertMaterial({
        color: 0x00ff6a,
        opacity: 0.5,
        transparent: true,
      })
      p1radarGeometry.rotateX(-Math.PI / 2)

      p1radar = new THREE.Mesh(p1radarGeometry, p1radarMaterial); //MESH POINTS MAT TO GEOMETRY
      p1radar.position.set(7, 8, 0);
      player.add(p1radar);

      //P2 RADAR
      // let p2radarGeometry = new THREE.SphereGeometry(.2, 1, 1);
      let p2radarGeometry = new THREE.ConeBufferGeometry(.1, .5, 4);
      let p2radarMaterial = new THREE.MeshLambertMaterial({
        color: 0xff2a00,
        opacity: 0.5,
        transparent: true,
      })
      p2radarGeometry.rotateX(-Math.PI / 2)


      p2radar = new THREE.Mesh(p2radarGeometry, p2radarMaterial); //MESH POINTS MAT TO GEOMETRY
      p2radar.position.set(7, 8, 0);
      player.add(p2radar);

      // //HP TEXT
      // var loader = new THREE.FontLoader();

      // let hpTxt;
      // loader.load('assets/text/helvetiker_regular.typeface.json', function (font) {

      //   var hpgeometry = new THREE.TextGeometry('H P', {
      //     font: font,
      //     size: 40,
      //     height: 5,
      //     curveSegments: 12,
      //     bevelEnabled: true,
      //     bevelThickness: 10,
      //     bevelSize: 2,
      //     bevelOffset: 0,
      //     bevelSegments: 5
      //   });

      //   let hpBarMaterial = new THREE.MeshLambertMaterial({
      //     color: 0x00ff6a,
      //     opacity: 0.75,
      //     transparent: true,
      //   })

      //   hpTxt = new THREE.Mesh(hpgeometry, hpBarMaterial)
      //   // debugger
      //   hpTxt.scale.set(.01, .01, .01)
      //   hpTxt.position.set(-9, 9.5, 0)
      //   hpTxt.rotation.y = Math.PI / 2 * .5
      //   hpTxt.rotation.x = Math.PI / 2 * .25
      //   player.add(hpTxt)

      //   // scene.add(hpTxt);
      // });

      //P1 Health Bar
      let hpBarGeometry = new THREE.BoxGeometry(5, .5, .5);
      let hpBarMaterial = new THREE.MeshLambertMaterial({
        color: 0x00ff6a,
        opacity: 0.75,
        transparent: true,
      })

      hpBar = new THREE.Mesh(hpBarGeometry, hpBarMaterial); //MESH POINTS MAT TO GEOMETRY
      hpBar.position.set(-8, 9, 0);
      // let ResizeWidthRatio = - 8 / 626;
      // hpBar.position.x = ResizeWidthRatio * window.innerWidth
      // console.log(`X position: ${hpBar.position.x}`)
      hpBar.rotation.y = Math.PI / 2 * .5
      hpBar.rotation.x = Math.PI / 2 * .25
      player.add(hpBar);

      // //HP2 TEXT
      // var loader = new THREE.FontLoader();

      // let hp2Txt;
      // loader.load('assets/text/helvetiker_regular.typeface.json', function (font) {

      //   var hp2geometry = new THREE.TextGeometry('O P P O N E N T  H P :', {
      //     font: font,
      //     size: 40,
      //     height: 5,
      //     curveSegments: 12,
      //     bevelEnabled: true,
      //     bevelThickness: 10,
      //     bevelSize: 2,
      //     bevelOffset: 0,
      //     bevelSegments: 5
      //   });

      //   let hp2BarMaterial = new THREE.MeshLambertMaterial({
      //     color: 0xff2e2e,
      //     opacity: 0.75,
      //     transparent: true,
      //   })

      //   hp2Txt = new THREE.Mesh(hp2geometry, hp2BarMaterial)
      //   // debugger
      //   hp2Txt.scale.set(.01, .01, .01)
      //   hp2Txt.position.set(-9, 6, 0)
      //   hp2Txt.rotation.y = Math.PI / 2 * .5
      //   hp2Txt.rotation.x = Math.PI / 2 * .25
      //   player.add(hp2Txt)

      //   // scene.add(hpTxt);
      // });

      //P2 Health Bar
      let hp2BarGeometry = new THREE.BoxGeometry(5, .5, .5);
      let hp2BarMaterial = new THREE.MeshLambertMaterial({
        color: 0xff2e2e,
        opacity: 0.75,
        transparent: true,
      })

      hp2Bar = new THREE.Mesh(hp2BarGeometry, hp2BarMaterial); //MESH POINTS MAT TO GEOMETRY
      hp2Bar.position.set(-8, 6, 0);
      // let ResizeWidthRatio = - 8 / 626;
      // hp2Bar.position.x = ResizeWidthRatio * window.innerWidth
      // console.log(`X position: ${hp2Bar.position.x}`)
      hp2Bar.rotation.y = Math.PI / 2 * .5
      hp2Bar.rotation.x = Math.PI / 2 * .25
      player.add(hp2Bar);





    }
  );

  let TreeLoader = new THREE.OBJLoader();
  for (let i = 0; i < 0; i++) {
    TreeLoader.load(
      'assets/tree.obj',
      function (object) {
        treeMesh = object.children[5]
        treeMesh.material.color.set(0x60a62e)
        treeMesh.scale.set(3, 3, 3)

        let treeGeometry = new THREE.BoxBufferGeometry(2, 60, 2); //PRIMITIVE SHAPE AND SIZE
        var treeMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: 0xffffff }), 0, 0)
        // let treeMaterial = new THREE.MeshLambertMaterial({ color: 0xff00C2 }); //COLOR OF MESH
        let tree = new Physijs.BoxMesh(treeGeometry, treeMaterial, 0); //MESH POINTS MAT TO GEOMETRY
        tree.name = 'tree';
        tree.visible = false;
        // tree.position.set(-53.5, 0, -25.5)
        tree.position.set(-161.5, 0, -77)

        tree.add(treeMesh)
        // treeMesh.add(tree);
        // tree.add(treeMesh)

        treeMesh.position.set(0, -718 * 1.5, 0);
        // treeMesh.rotation.y = Math.PI/Math.random();
        // debugger
        let randX = (Math.random() - 0.5) * 600;;
        let randZ = (Math.random() - 0.5) * 600;

        // treeMesh.add(tree)
        // treeMesh.position.x = (Math.random() - 0.5) * 600;
        // treeMesh.position.y = -718 * 1.5
        // treeMesh.position.z = (Math.random() - 0.5) * 600;
        // scene.add(tree)

        treeMesh.position.x += randX
        tree.position.x += randX
        treeMesh.position.z += randZ
        tree.position.z += randZ

        scene.add(treeMesh)
        scene.add(tree)

        tree.addEventListener('collision', function (other_object, linear_velocity, angular_velocity) {
          if (other_object.name === 'bullet') {
            // player.points += 1;
            // let pointEle = document.getElementById('points')
            // pointEle.innerHTML = `Score: ${player.points}`
            // tree.visible = false;
            // scene.remove(this)
          }
        });

      }
    );
  }

// //A huge city w/o colliders or physics 
// let cityLoader = new THREE.OBJLoader();
// cityLoader.load(
//   'assets/City.obj',
//   function (object) {

//     for (let i = 0; i < object.children.length; i++) {
//       cityMesh = object.children[i]
//       if (i % 2 === 0) {
//         debugger
//         cityMesh.material.color.set(0xa39f98);
//       } else {
//         cityMesh.material.color.set(0xc4b9a7);
//       }


//       cityMesh.position.set(0, 0, 400);
//       scene.add(cityMesh)
//     }
// }
// );

// //TEXT LOADING
// var loader = new THREE.FontLoader();

// loader.load('assets/text/helvetiker_regular.typeface.json', function (font) {

//   var hpgeometry = new THREE.TextGeometry('HP', {
//     font: font,
//     size: 80,
//     height: 5,
//     curveSegments: 12,
//     bevelEnabled: true,
//     bevelThickness: 10,
//     bevelSize: 8,
//     bevelOffset: 0,
//     bevelSegments: 5
//   });

//   let hpBarMaterial = new THREE.MeshLambertMaterial({
//     color: 0x00ff6a,
//     opacity: 0.75,
//     transparent: true,
//   })

//   hpTxt = new THREE.Mesh(hpgeometry, hpBarMaterial)
//   // hpTxt.scale.set(.01, .01, .01)
//   hpTxt.position.set(0,3,0)

//   scene.add(hpTxt);
// });
  //!fileUploader.js


  //!MAIN.JS
  let camera, sceneHUD, cameraHUD, rotateAngle, renderer, scene, player, bullets, bulletsBlock, input, environment, clock, lastTimeStamp;
  let player2 = { id: null, x: 0, y: 0, z: 0, ph: 0 };
  let serverPackage = [];
  let player2Data = { id: null, x: 0, y: 0, z: 0, ph: 0 };
  let bulletCount = 0;
  let j = 0;
  let radar;
  let p1radar;
  p1radar = { position: { x: 0, y: 0, z: 0 } };
  let p2radar;
  p2radar = { position: { x: 0, y: 0, z: 0 } };
  let hpBar, hpTxt = { position: { x: 0, y: 0, z: 0 } };;
  let hpBar2, hp2Txt = { position: { x: 0, y: 0, z: 0 } };;

  let RELOAD = 1000;

  var stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  // document.body.appendChild(stats.dom);

  function reset() {

    setTimeout(() => {
      player.hp = 20;
      player2.hp = 20;
      let pointEle = document.getElementById('points')
      player.points2 += 1;
      pointEle.innerHTML = `Score: ${player.points2}`
      // player.position.set(0, 20, 0);
      // player2.position.set(0, 20, 0);
      // location.reload()
      // animate().reset();
    }, 0);
    // animate();
    // requestAnimationFrame(animate);
  }

  function init() {
    //Crosshair
    crosshair = document.createElement('h1');
    crosshair.id = 'cross'
    crosshair.style.cssText = `
  position: absolute;
  left: 49.75%;
  font-size: 10px;
  font-family: fantasy;
  top: 40%;
  `;
    document.body.appendChild(crosshair);
    crosshair.innerHTML = 'X'


    // 201 
    Physijs.scripts.worker = './lib/physijs_worker.js';
    Physijs.scripts.ammo = './lib/ammo.js';

    // 02
    //RENDERER INPUT, SCENE (virtual environment)/CAMERA 
    // let scene = new THREE.Scene();
    scene = new Physijs.Scene;

    // let scene = new Physijs.Scene({ reportsize: 50, fixedTimeStep: 1 / 20 }); //Slow down scene to fix rotation bug
    scene.setGravity(new THREE.Vector3(0, -15, 0));
    {
      const color = 'black';  // white
      const near = 90;
      const far = 300;
      scene.fog = new THREE.Fog(color, near, far);
    }
    scene.background = new THREE.Color('skyblue');

    createCamera();
    createLights();
    createMeshes();
    createRenderer();


    //202
    //Bullets
    bullets = new Bullets();
    // let bulletsBlockGeometry = new THREE.SphereGeometry(1, 1, 1); //PRIMITIVE SHAPE AND SIZE
    // let bulletsBlockMaterial = new THREE.MeshLambertMaterial({ color: 0xff00C2 }); //COLOR OF MESH
    // bulletsBlock = new Physijs.BoxMesh(bulletsBlockGeometry, bulletsBlockMaterial); //MESH POINTS MAT TO GEOMETRY

    // 101
    //INPUT OBJECT
    input = new Input();

    // 001
    // Environment
    environment = new Environment();



    // 05
    //MAKE WINDOW RESPONSIVE ON RESIZE
    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;

      camera.updateProjectionMatrix();
    })

    // 06
    //RAYCASTER => VECTOR 'RAY'... RAY === Array? (like vector array?)
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();


    // 09
    //RENDER LOOP
    // 102
    //Normalize animation loop
    lastTimeStamp = 0;

    clock = new THREE.Clock();
    _vector = new THREE.Vector3(0, 0, 0)


    // debugger
    socket.emit('init', {
      id: socket.id,
      x: player.position.x,
      y: player.position.y,
      z: player.position.z,
      h: player.rotation.y,
      pb: player.rotation.y
    });


  }

  function createCamera() {
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      300
    );
    // debugger

    camera.position.set(0, 6, 10);
    camera.rotation.x = -.2
  }

  function createLights() {
    // 08
    //LIGHT ONE
    let light1 = new THREE.DirectionalLight(0xFFFFFF, 2);
    light1.position.set(0, 20, 25)
    scene.add(light1)

    //LIGHT TWO
    let light2 = new THREE.AmbientLight(0xaaaaaa, 1);
    light2.position.set(0, 0, 25)
    scene.add(light2)


    // const ambientLight = new THREE.HemisphereLight(
    //   0xddeeff,
    //   0x202020,
    //   .5,
    // );
    // scene.add(ambientLight)

  }

  function createMeshes() {
    // 07
    //ELEMENT ONE (**LOOK UP MATERIAL OPTIONS**)
    let playerGeometry = new THREE.BoxBufferGeometry(5, 8, 5, 0); //PRIMITIVE SHAPE AND SIZE (set 3rd val to 111 for cat paw)
    let playerMaterial = new THREE.MeshLambertMaterial({
      color: 0x22CAC2,
      opacity: 0.0,
      visible: false,
    }); //COLOR OF MESH
    //ELEMENT ONE (**LOOK UP MATERIAL OPTIONS**)

    // let player = new THREE.Mesh(playerGeometry, playerMaterial); //MESH POINTS MAT TO GEOMETRY
    player = new Physijs.BoxMesh(playerGeometry, playerMaterial); //MESH POINTS MAT TO GEOMETRY
    player.position.set(0, 1, 0);
    player.name = 'player';
    player.hp = 20;
    player.add(camera)
    player.points2 = 0;

    let player2Geometry = new THREE.CubeGeometry(5, 8, 5, 0);
    let player2Material = new THREE.MeshLambertMaterial({
      color: 0x22CAC2,
      opacity: 0.0,
    })

    player2 = new Physijs.BoxMesh(playerGeometry, playerMaterial);

    player2.hp = 20;
  }

  function createRenderer() {
    // 03
    //INSTANCE OF RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // renderer.gammaFactorw

    renderer.physicallyCorrectLights = true;
    // renderer.setClearColor("#e5e5e5"); //BACKGROUND COLOR

    //HUD
    hud = document.getElementById('hud');
    hud.style.cssText = `
    display: flex;
  `;



    //SCORE
    pointTally = document.createElement('h1');
    pointTally.id = 'points'
    pointTally.style.cssText = `
    position: absolute;
    bottom: 0;
    text-transform: uppercase;
    font-size: 20px;
    // margin-left: 20px;
    margin: 0 auto;
  `;
    document.body.appendChild(pointTally);
    pointTally.innerHTML = 'Score: 0'

    //INSTRUCTIONS
    pointTally = document.createElement('h1');
    pointTally.id = 'instructions'
    pointTally.style.cssText = `
    position: absolute;
    bottom: 0px;
    font-family: monospace;
    right: 0px;
    text-transform: uppercase;
    font-size: 18px;
    /* margin: 0px auto; */
    margin: 10px;
  `;
    document.body.appendChild(pointTally);
    pointTally.innerHTML = 'W/A/S/D: Move <br /> Q/E: Rotate <br /> J: Fire <br /> SPACE: Fly <br /> K: Descend'

    //P2 HP
    opponentHP = document.createElement('h1');
    opponentHP.id = 'opponent'
    opponentHP.style.position = 'absolute';
    opponentHP.style.marginTop = '70';
    opponentHP.style.cssText = `
    margin: 75px 20px 20px;
    position: absolute;
    transform: skewY(-9deg);
  `
    // document.body.appendChild(opponentHP);
    // hud.appendChild(opponentHP);
    opponentHP.innerHTML = `Opponent HP: ${player2.hp}`;

    //P1 HP
    playerHP = document.createElement('h1');
    playerHP.id = 'player'
    playerHP.style.position = 'absolute';
    playerHP.style.marginTop = '45';
    playerHP.style.cssText = `
    margin: 20px;
    position: absolute;
    transform: skewY(-9deg);
  `
    // hud.appendChild(playerHP);
    if (player.hp) {
      playerHP.innerHTML = `HP: ${player.hp}`;
    } else {
      playerHP.innerHTML = `HP: 20`;
    }

    // //P1 HP BAR
    // p1hpBar = document.createElement('div');
    // p1hpBar.id = 'p1hpbar';
    // p1hpBar.style.cssText = `
    //   margin: 55px 20px 45px;
    //   opacity: 0.75;
    //   height: 9px;
    //   border: 2px solid black;
    //   width: ${player.hp * 10}px;
    //   position: absolute;
    //   background-color: green;
    //   transform: skewY(-9deg);
    // `;

    // hud.appendChild(p1hpBar);


    //p2 HP BAR
    // p2hpBar = document.createElement('div');
    // p2hpBar.id = 'p2hpbar';
    // p2hpBar.style.cssText = `
    //   margin: 121px 20px 45px;
    //   opacity: 0.75;
    //   height: 9px;
    //   border: 2px solid black;
    //   width: ${player2.hp * 10}px;
    //   position: absolute;
    //   background-color: red;
    //   transform: skewY(-9deg);
    // `;
    // hud.appendChild(p2hpBar);

    // //Time...?
    // timeTally = document.createElement('h1');
    // timeTally.id = 'time'
    // timeTally.style.position = 'absolute';
    // timeTally.style.marginTop = '100';
    // document.body.appendChild(timeTally);
    // timeTally.innerHTML = 'Time: 0'

    //Winner text...
    winnerUI = document.createElement('h1');
    winnerUI.id = 'winner'
    winnerUI.style.position = 'absolute';
    winnerUI.style.marginTop = '130';
    // document.body.appendChild(winnerUI);
    winnerUI.style.cssText = `
    transform: skewY(-9deg);
    margin: 161px 20px;
    position: absolute;
  `
    winnerUI.innerHTML = 'FIGHT!'


    document.body.appendChild(renderer.domElement);
  }




  let animate = function (timeStamp) {
    // let p1bar = document.getElementById('p1hpbar')
    // p1bar.style.width = `${player.hp * 10}px`
    // let p2bar = document.getElementById('p2hpbar')
    // p2bar.style.width = `${player2.hp * 10}px`
    stats.begin();


    player.setAngularFactor(_vector);
    player.setAngularVelocity(_vector);
    // player.setLinearVelocity(new THREE.Vector3(0, 0, 0));

    let delta = clock.getDelta(); // seconds
    // console.log(clock.getElapsedTime())
    let moveDistance = 200 * delta; // 200 pixels per second
    rotateAngle = Math.PI / 2 * delta; // pi/2 radians (90 deg) per sec

    let time = document.getElementById('time')
    // time.innerHTML = `Time: ${Math.floor(clock.elapsedTime * 100)}`
    // let socketData = 'nope';
    // time.innerHTML = `Time: ${socketData}`

    let start = requestAnimationFrame(animate);

    //!Comment in for time challenge!!!
    // if (Math.floor(clock.elapsedTime * 100) >= RELOAD) {
    //   let pointEle = document.getElementById('points')
    //   // pointEle.className= 'finalpoint';
    //   pointEle.style = 'color: red; position: absolute; top: 20%; left: 40%; padding: 10px; border: 5px solid black;';
    //   pointEle.innerHTML = `Final Score: ${player.points}`
    //   // pointEle.style = `align: center;`
    //   cancelAnimationFrame(start);
    //   reset(animate);
    // }

    let timeDelta = (timeStamp - lastTimeStamp) / 1000;
    lastTimeStamp = timeStamp;

    let movementSpeed = 12 * timeDelta;


    //BOOST
    let boost = 1;
    if (input.isShiftPressed) {
      boost = 10 * movementSpeed;
      // boost = 1
    }

    let playerSpeed = movementSpeed * boost * 2;

    //LEFT
    if (input.isLeftPressed) {
      player.__dirtyPosition = true;
      player.__dirtyRotation = true;
      player.setLinearVelocity(_vector);
      player.translateOnAxis(new THREE.Vector3(playerSpeed * 100, 0, 0), -rotateAngle)

      // player.position.x -= Math.sin(player.rotation.y + Math.PI / 2) * playerSpeed;
      // player.position.z -= Math.cos(player.rotation.y + Math.PI / 2) * playerSpeed;
    }
    //RIGHT
    if (input.isRightPressed) {
      player.__dirtyPosition = true;
      player.__dirtyRotation = true;
      player.setLinearVelocity(_vector);
      player.translateOnAxis(new THREE.Vector3(-playerSpeed * 100, 0, 0), -rotateAngle)

      // player.position.x += Math.sin(player.rotation.y + Math.PI / 2) * playerSpeed;
      // player.position.z += Math.cos(player.rotation.y + Math.PI / 2) * playerSpeed;
    }
    //JUMP  
    if (input.isSpacePressed) {
      player.__dirtyPosition = true;
      player.__dirtyRotation = true;
      player.setLinearVelocity(_vector);
      player.setAngularFactor(_vector);
      player.setAngularVelocity(_vector);
      player.translateOnAxis(new THREE.Vector3(0, -movementSpeed * 100, 0), -rotateAngle)
      // player.position.y += playerSpeed*2;
    }

    if (input.isXPressed) {
      player.__dirtyPosition = true;
      player.__dirtyRotation = true;
      if (player.position.y > 4.5) {
        player.translateOnAxis(new THREE.Vector3(0, movementSpeed * 100, 0), -rotateAngle)
        player.setAngularFactor(_vector);
        player.setAngularVelocity(_vector);
      }
    }

    //FWD 


    if (input.isFwdPressed) {
      player.__dirtyPosition = true;
      player.__dirtyRotation = true;
      player.setAngularFactor(_vector);
      player.setAngularVelocity(_vector);
      player.setAngularFactor(_vector);
      player.setLinearVelocity(_vector);

      player.translateOnAxis(new THREE.Vector3(0, 0, playerSpeed * 100), -rotateAngle)
      // console.log(player.getWorldQuaternion())



      // delete3DOBJ('bullet');

      // player.position.x -= Math.sin(player.rotation.y) * playerSpeed;
      // player.position.z -= Math.cos(player.rotation.y) * playerSpeed;
    }
    //BACK 
    if (input.isBwdPressed) {
      player.__dirtyPosition = true;
      player.__dirtyRotation = true;
      player.setLinearVelocity(_vector);
      player.translateOnAxis(new THREE.Vector3(0, 0, -playerSpeed * 100), -rotateAngle)

      // player.position.x += Math.sin(player.rotation.y) * playerSpeed;
      // player.position.z += Math.cos(player.rotation.y) * playerSpeed;
    }
    //RotLeft
    if (input.isRLPressed) {
      // player.rotation.y += playerSpeed/4;
      player.rotateOnAxis(new THREE.Vector3(0, 1, 0), +0.05);
      player.setLinearVelocity(_vector);
      // console.log(player.rotateOnAxis)
      player.__dirtyPosition = true;
      player.__dirtyRotation = true;
    }
    //RotRight
    if (input.isRRPressed) {

      player.rotateOnAxis(new THREE.Vector3(0, 1, 0), -0.05);
      player.setLinearVelocity(_vector);
      player.__dirtyPosition = true;
      player.__dirtyRotation = true;
    }


    //Player BULLETS
    if (input.isFirePressed) {

      if (j % 2 === 0) {
        // console.log(j)
        bullets.fire()
      }
      j += 1;
      let xCompensator = ((player.rotation.y / Math.PI) * -2) * 100
      let zCompensator = 100 / (xCompensator + 1)

      let wpVector2 = new THREE.Vector3();
      if (bulletsLBlock.name = 'bullet') {
        bulletsLBlock.setLinearVelocity(new THREE.Vector3(-player.getWorldDirection(wpVector2).x * 500, 0, player.getWorldDirection(wpVector2).z * -500))
      }

      //LIMITED BULLET COUNT
      for (let i = 0; i < scene.children.length; i++) {
        if (scene.children[i].name === 'bullet') {
          // debugger
          bulletCount += 1
          if (bulletCount > 200) {
            // debugger
            for (let i = 0; i < scene.children.length; i++) {
              if (scene.children[i].name === 'bullet') {
                scene.remove(scene.children[i])
              }
            }
            bulletCount = 0;
          }
        }
      }
      player.setAngularFactor(_vector);
      player.setAngularVelocity(_vector);
    }

    //Player2 BULLETS
    if (player2.firing) {
      // if (j % 10 === 0) {
      bullets.p2fire()
      // }

      let wpVector2 = new THREE.Vector3();
      if (p2BulletsBlock.name === 'bullet') {
        p2BulletsBlock.setLinearVelocity(new THREE.Vector3(-player2.getWorldDirection(wpVector2).x * 400, 0, player2.getWorldDirection(wpVector2).z * -400))
      }

      //LIMITED BULLET COUNT
      for (let i = 0; i < scene.children.length; i++) {
        if (scene.children[i].name === 'bullet') {
          // debugger
          bulletCount += 1
          if (bulletCount > 100) {
            // debugger
            for (let i = 0; i < scene.children.length; i++) {
              if (scene.children[i].name === 'bullet') {
                scene.remove(scene.children[i])
              }
            }
            bulletCount = 0;
          }
        }
      }
      player2.setAngularFactor(_vector);
      player2.setAngularVelocity(_vector);
    }


    // //GRAVITY...fix this please
    // if (player.position.y <= 1) {
    //   player.translateOnAxis(new THREE.Vector3(0, 0, 0), -rotateAngle)
    // } else {
    //   player.translateOnAxis(new THREE.Vector3(0, playerSpeed * 50, 0), -rotateAngle)
    // }
    // camera.lookAt(player.position)


    function delete3DOBJ(objName) {
      let selectedObject = scene.getObjectByName(objName);
      if (selectedObject) {
        scene.remove(selectedObject);
      }

      // animate();
    }

    // socket.emit('spawn', {
    //   id: socket.id,
    //   x: player.position.x,
    //   y: player.position.y,
    //   z: player.position.z,
    //   h: player.rotation.y,
    //   pb: player.rotation.x
    // });

    let wpVector2 = new THREE.Vector3();
    player.getWorldDirection(wpVector2).y

    if (player.hp <= 0 || player2.hp <= 0) {
      reset();
      // player.hp = 200;
      // player2.hp = 200;
      // debugger
    }

    // if (player2.hp <= 0) {
    //   // player.hp = 200;
    //   // player2.hp = 200;
    //   // debugger
    //   reset();
    // }

    //PLAYER 2 UPDATE
    var tquaternion = new THREE.Quaternion()
    if (player2Data.h) {
      player2Data.h = player2Data.h
    } else {
      player2Data.h = tquaternion
    }
    player2.position.x = player2Data.x;
    player2.position.y = player2Data.y;
    player2.position.z = player2Data.z;
    player2.rotation.setFromQuaternion(player2Data.h);
    player2.firing = player2Data.firing;
    player.hp = player2Data.hp || 20;
    // debugger
    scene.add(player2)

    let adjustRot = THREE.Math.degToRad(20)
    //PLAYER EMIT
    socket.emit('updatedPos', {
      id: socket.id,
      x: player.position.x,
      y: player.position.y,
      z: player.position.z,
      h: player.getWorldQuaternion(tquaternion),
      firing: input.isFirePressed,
      hp: player2.hp,
      pb: player.position.y,
    });


    socket.on('otherSpawn', (serverPack) => {
      serverPackage = serverPack
    })
    // debugger
    for (let i = 0; i < serverPackage.length; i++) {
      if (serverPackage[i].id !== socket.id) {
        player2Data = serverPackage[i];
      }
    }


    // opponent = document.getElementById('player')
    // opponent.innerHTML = `HP: ${player.hp}`;

    let ResizeWidthRatio = 8 / 626;
    //RADAR_P1
    let radarX = player.position.x / 300 + 7;
    let radarY = player.position.y / 300 + 8;
    let radarZ = player.position.z / 300;
    // radar.position.x = ResizeWidthRatio * window.innerWidth - 3;


    if (radarX > 5 && radarX < 8 && radarY > 6 && radarY < 9 && radarZ > -2 && radarZ < 2) {
      p1radar.position.x = radarX;
      p1radar.position.y = radarY;
      p1radar.position.z = radarZ;
    }
    p1radar.rotation.setFromQuaternion(player.getWorldQuaternion(tquaternion));

    let radarX2 = player2.position.x / 300 + 7;
    let radarY2 = player2.position.y / 300 + 8;
    let radarZ2 = player2.position.z / 300;

    //RADAR_P1
    if (radarX2 > 5 && radarX2 < 8 && radarY2 > 6 && radarY2 < 9 && radarZ2 > -2 && radarZ2 < 2) {
      p2radar.position.x = radarX2;
      p2radar.position.y = radarY2;
      p2radar.position.z = radarZ2;
    }
    p2radar.rotation.setFromQuaternion(player2.getWorldQuaternion(tquaternion));

    //HPBAR
    hpBar.scale.x = (.25 * player.hp) / 5
    // hpBar.position.x = - ResizeWidthRatio * window.innerWidth + 4;
    // hpBar.position.x = 4;

    // //HPTEXT
    // hpTxt.position.x = - ResizeWidthRatio * window.innerWidth + 4;
    // hpTxt.position.x = 4;

    //HP2BAR
    hp2Bar.scale.x = (.25 * player2.hp) / 5
    // hp2Bar.position.x = - ResizeWidthRatio * window.innerWidth + 4;

    // //HP2TEXT
    // hp2Txt.position.x = - ResizeWidthRatio * window.innerWidth + 4;


    scene.simulate();
    // renderer.render(sceneHUD, cameraHUD)
    renderer.render(scene, camera);
    stats.end();


  };

  init();

  // 11 
  //...10 is mouse event listener, 12 is adding listener to window)...
  // CALL RENDER LOOP
  animate();
}
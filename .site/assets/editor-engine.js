var Ll=Object.create;var mn=Object.defineProperty;var Cl=Object.getOwnPropertyDescriptor;var wl=Object.getOwnPropertyNames;var Rl=Object.getPrototypeOf,Gl=Object.prototype.hasOwnProperty;var Fl=(G,J,fe)=>J in G?mn(G,J,{enumerable:!0,configurable:!0,writable:!0,value:fe}):G[J]=fe;var Dl=(G,J)=>()=>(J||G((J={exports:{}}).exports,J),J.exports);var Ol=(G,J,fe,Ce)=>{if(J&&typeof J=="object"||typeof J=="function")for(let le of wl(J))!Gl.call(G,le)&&le!==fe&&mn(G,le,{get:()=>J[le],enumerable:!(Ce=Cl(J,le))||Ce.enumerable});return G};var Il=(G,J,fe)=>(fe=G!=null?Ll(Rl(G)):{},Ol(J||!G||!G.__esModule?mn(fe,"default",{value:G,enumerable:!0}):fe,G));var at=(G,J,fe)=>Fl(G,typeof J!="symbol"?J+"":J,fe);var Lo=Dl((dn,vn)=>{"use strict";(function(G,J){typeof dn=="object"&&typeof vn<"u"?vn.exports=J():typeof define=="function"&&define.amd?define(J):G.createREGL=J()})(dn,function(){"use strict";var G=function(e){return e instanceof Uint8Array||e instanceof Uint16Array||e instanceof Uint32Array||e instanceof Int8Array||e instanceof Int16Array||e instanceof Int32Array||e instanceof Float32Array||e instanceof Float64Array||e instanceof Uint8ClampedArray},J=function(e,t){for(var s=Object.keys(t),y=0;y<s.length;++y)e[s[y]]=t[s[y]];return e},fe=`
`;function Ce(e){return typeof atob<"u"?atob(e):"base64:"+e}function le(e){var t=new Error("(regl) "+e);throw console.error(t),t}function ce(e,t){e||le(t)}function pe(e){return e?": "+e:""}function Se(e,t,s){e in t||le("unknown parameter ("+e+")"+pe(s)+". possible values: "+Object.keys(t).join())}function re(e,t){G(e)||le("invalid parameter type"+pe(t)+". must be a typed array")}function de(e,t){switch(t){case"number":return typeof e=="number";case"object":return typeof e=="object";case"string":return typeof e=="string";case"boolean":return typeof e=="boolean";case"function":return typeof e=="function";case"undefined":return typeof e>"u";case"symbol":return typeof e=="symbol"}}function $e(e,t,s){de(e,t)||le("invalid parameter type"+pe(s)+". expected "+t+", got "+typeof e)}function Me(e,t){e>=0&&(e|0)===e||le("invalid parameter type, ("+e+")"+pe(t)+". must be a nonnegative integer")}function je(e,t,s){t.indexOf(e)<0&&le("invalid value"+pe(s)+". must be one of: "+t)}var gr=["gl","canvas","container","attributes","pixelRatio","extensions","optionalExtensions","profile","onDone"];function Vr(e){Object.keys(e).forEach(function(t){gr.indexOf(t)<0&&le('invalid regl constructor argument "'+t+'". must be one of '+gr)})}function _r(e,t){for(e=e+"";e.length<t;)e=" "+e;return e}function nt(){this.name="unknown",this.lines=[],this.index={},this.hasErrors=!1}function Tt(e,t){this.number=e,this.line=t,this.errors=[]}function At(e,t,s){this.file=e,this.line=t,this.message=s}function wr(){var e=new Error,t=(e.stack||e).toString(),s=/compileProcedure.*\n\s*at.*\((.*)\)/.exec(t);if(s)return s[1];var y=/compileProcedure.*\n\s*at\s+(.*)(\n|$)/.exec(t);return y?y[1]:"unknown"}function bn(){var e=new Error,t=(e.stack||e).toString(),s=/at REGLCommand.*\n\s+at.*\((.*)\)/.exec(t);if(s)return s[1];var y=/at REGLCommand.*\n\s+at\s+(.*)\n/.exec(t);return y?y[1]:"unknown"}function da(e,t){var s=e.split(`
`),y=1,L=0,x={unknown:new nt,0:new nt};x.unknown.name=x[0].name=t||wr(),x.unknown.lines.push(new Tt(0,""));for(var A=0;A<s.length;++A){var D=s[A],F=/^\s*#\s*(\w+)\s+(.+)\s*$/.exec(D);if(F)switch(F[1]){case"line":var N=/(\d+)(\s+\d+)?/.exec(F[2]);N&&(y=N[1]|0,N[2]&&(L=N[2]|0,L in x||(x[L]=new nt)));break;case"define":var M=/SHADER_NAME(_B64)?\s+(.*)$/.exec(F[2]);M&&(x[L].name=M[1]?Ce(M[2]):M[2]);break}x[L].lines.push(new Tt(y++,D))}return Object.keys(x).forEach(function(P){var H=x[P];H.lines.forEach(function(O){H.index[O.number]=O})}),x}function Ho(e){var t=[];return e.split(`
`).forEach(function(s){if(!(s.length<5)){var y=/^ERROR:\s+(\d+):(\d+):\s*(.*)$/.exec(s);y?t.push(new At(y[1]|0,y[2]|0,y[3].trim())):s.length>0&&t.push(new At("unknown",0,s))}}),t}function jo(e,t){t.forEach(function(s){var y=e[s.file];if(y){var L=y.index[s.line];if(L){L.errors.push(s),y.hasErrors=!0;return}}e.unknown.hasErrors=!0,e.unknown.lines[0].errors.push(s)})}function Xo(e,t,s,y,L){if(!e.getShaderParameter(t,e.COMPILE_STATUS)){var x=e.getShaderInfoLog(t),A=y===e.FRAGMENT_SHADER?"fragment":"vertex";_n(s,"string",A+" shader source must be a string",L);var D=da(s,L),F=Ho(x);jo(D,F),Object.keys(D).forEach(function(N){var M=D[N];if(!M.hasErrors)return;var P=[""],H=[""];function O(B,h){P.push(B),H.push(h||"")}O("file number "+N+": "+M.name+`
`,"color:red;text-decoration:underline;font-weight:bold"),M.lines.forEach(function(B){if(B.errors.length>0){O(_r(B.number,4)+"|  ","background-color:yellow; font-weight:bold"),O(B.line+fe,"color:red; background-color:yellow; font-weight:bold");var h=0;B.errors.forEach(function(T){var k=T.message,Z=/^\s*'(.*)'\s*:\s*(.*)$/.exec(k);if(Z){var R=Z[1];switch(k=Z[2],R){case"assign":R="=";break}h=Math.max(B.line.indexOf(R,h),0)}else h=0;O(_r("| ",6)),O(_r("^^^",h+3)+fe,"font-weight:bold"),O(_r("| ",6)),O(k+fe,"font-weight:bold")}),O(_r("| ",6)+fe)}else O(_r(B.number,4)+"|  "),O(B.line+fe,"color:red")}),typeof document<"u"&&!window.chrome?(H[0]=P.join("%c"),console.log.apply(console,H)):console.log(P.join(""))}),ce.raise("Error compiling "+A+" shader, "+D[0].name)}}function Wo(e,t,s,y,L){if(!e.getProgramParameter(t,e.LINK_STATUS)){var x=e.getProgramInfoLog(t),A=da(s,L),D=da(y,L),F='Error linking program with vertex shader, "'+D[0].name+'", and fragment shader "'+A[0].name+'"';typeof document<"u"?console.log("%c"+F+fe+"%c"+x,"color:red;text-decoration:underline;font-weight:bold","color:red"):console.log(F+fe+x),ce.raise(F)}}function gn(e){e._commandRef=wr()}function $o(e,t,s,y){gn(e);function L(F){return F?y.id(F):0}e._fragId=L(e.static.frag),e._vertId=L(e.static.vert);function x(F,N){Object.keys(N).forEach(function(M){F[y.id(M)]=!0})}var A=e._uniformSet={};x(A,t.static),x(A,t.dynamic);var D=e._attributeSet={};x(D,s.static),x(D,s.dynamic),e._hasCount="count"in e.static||"count"in e.dynamic||"elements"in e.static||"elements"in e.dynamic}function St(e,t){var s=bn();le(e+" in command "+(t||wr())+(s==="unknown"?"":" called from "+s))}function qo(e,t,s){e||St(t,s||wr())}function Yo(e,t,s,y){e in t||St("unknown parameter ("+e+")"+pe(s)+". possible values: "+Object.keys(t).join(),y||wr())}function _n(e,t,s,y){de(e,t)||St("invalid parameter type"+pe(s)+". expected "+t+", got "+typeof e,y||wr())}function Qo(e){e()}function Ko(e,t,s){e.texture?je(e.texture._texture.internalformat,t,"unsupported texture format for attachment"):je(e.renderbuffer._renderbuffer.format,s,"unsupported renderbuffer format for attachment")}var Lt=33071,xn=9728,Zo=9984,Jo=9985,eu=9986,ru=9987,tu=5120,au=5121,nu=5122,iu=5123,ou=5124,uu=5125,yn=5126,En=32819,Tn=32820,An=33635,Sn=34042,su=36193,er={};er[tu]=er[au]=1,er[nu]=er[iu]=er[su]=er[An]=er[En]=er[Tn]=2,er[ou]=er[uu]=er[yn]=er[Sn]=4;function Ln(e,t){return e===Tn||e===En||e===An?2:e===Sn?4:er[e]*t}function Ct(e){return!(e&e-1)&&!!e}function fu(e,t,s){var y,L=t.width,x=t.height,A=t.channels;ce(L>0&&L<=s.maxTextureSize&&x>0&&x<=s.maxTextureSize,"invalid texture shape"),(e.wrapS!==Lt||e.wrapT!==Lt)&&ce(Ct(L)&&Ct(x),"incompatible wrap mode for texture, both width and height must be power of 2"),t.mipmask===1?L!==1&&x!==1&&ce(e.minFilter!==Zo&&e.minFilter!==eu&&e.minFilter!==Jo&&e.minFilter!==ru,"min filter requires mipmap"):(ce(Ct(L)&&Ct(x),"texture must be a square power of 2 to support mipmapping"),ce(t.mipmask===(L<<1)-1,"missing or incomplete mipmap data")),t.type===yn&&(s.extensions.indexOf("oes_texture_float_linear")<0&&ce(e.minFilter===xn&&e.magFilter===xn,"filter not supported, must enable oes_texture_float_linear"),ce(!e.genMipmaps,"mipmap generation not supported with float textures"));var D=t.images;for(y=0;y<16;++y)if(D[y]){var F=L>>y,N=x>>y;ce(t.mipmask&1<<y,"missing mipmap data");var M=D[y];if(ce(M.width===F&&M.height===N,"invalid shape for mip images"),ce(M.format===t.format&&M.internalformat===t.internalformat&&M.type===t.type,"incompatible type for mip image"),!M.compressed)if(M.data){var P=Math.ceil(Ln(M.type,A)*F/M.unpackAlignment)*M.unpackAlignment;ce(M.data.byteLength===P*N,"invalid data for image, buffer size is inconsistent with image format")}else M.element||M.copy}else e.genMipmaps||ce((t.mipmask&1<<y)===0,"extra mipmap data");t.compressed&&ce(!e.genMipmaps,"mipmap generation for compressed images not supported")}function lu(e,t,s,y){var L=e.width,x=e.height,A=e.channels;ce(L>0&&L<=y.maxTextureSize&&x>0&&x<=y.maxTextureSize,"invalid texture shape"),ce(L===x,"cube map must be square"),ce(t.wrapS===Lt&&t.wrapT===Lt,"wrap mode not supported by cube map");for(var D=0;D<s.length;++D){var F=s[D];ce(F.width===L&&F.height===x,"inconsistent cube map face shape"),t.genMipmaps&&(ce(!F.compressed,"can not generate mipmap for compressed textures"),ce(F.mipmask===1,"can not specify mipmaps and generate mipmaps"));for(var N=F.images,M=0;M<16;++M){var P=N[M];if(P){var H=L>>M,O=x>>M;ce(F.mipmask&1<<M,"missing mipmap data"),ce(P.width===H&&P.height===O,"invalid shape for mip images"),ce(P.format===e.format&&P.internalformat===e.internalformat&&P.type===e.type,"incompatible type for mip image"),P.compressed||(P.data?ce(P.data.byteLength===H*O*Math.max(Ln(P.type,A),P.unpackAlignment),"invalid data for image, buffer size is inconsistent with image format"):P.element||P.copy)}}}}var n=J(ce,{optional:Qo,raise:le,commandRaise:St,command:qo,parameter:Se,commandParameter:Yo,constructor:Vr,type:$e,commandType:_n,isTypedArray:re,nni:Me,oneOf:je,shaderError:Xo,linkError:Wo,callSite:bn,saveCommandRef:gn,saveDrawInfo:$o,framebufferFormat:Ko,guessCommand:wr,texture2D:fu,textureCube:lu}),cu=0,mu=0,du=5,vu=6;function Rr(e,t){this.id=cu++,this.type=e,this.data=t}function Cn(e){return e.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}function it(e){if(e.length===0)return[];var t=e.charAt(0),s=e.charAt(e.length-1);if(e.length>1&&t===s&&(t==='"'||t==="'"))return['"'+Cn(e.substr(1,e.length-2))+'"'];var y=/\[(false|true|null|\d+|'[^']*'|"[^"]*")\]/.exec(e);if(y)return it(e.substr(0,y.index)).concat(it(y[1])).concat(it(e.substr(y.index+y[0].length)));var L=e.split(".");if(L.length===1)return['"'+Cn(e)+'"'];for(var x=[],A=0;A<L.length;++A)x=x.concat(it(L[A]));return x}function wn(e){return"["+it(e).join("][")+"]"}function hu(e,t){return new Rr(e,wn(t+""))}function pu(e){return typeof e=="function"&&!e._reglType||e instanceof Rr}function Rn(e,t){if(typeof e=="function")return new Rr(mu,e);if(typeof e=="number"||typeof e=="boolean")return new Rr(du,e);if(Array.isArray(e))return new Rr(vu,e.map(function(s,y){return Rn(s,t+"["+y+"]")}));if(e instanceof Rr)return e;n(!1,"invalid option type in uniform "+t)}var rr={DynamicVariable:Rr,define:hu,isDynamic:pu,unbox:Rn,accessor:wn},va={next:typeof requestAnimationFrame=="function"?function(e){return requestAnimationFrame(e)}:function(e){return setTimeout(e,16)},cancel:typeof cancelAnimationFrame=="function"?function(e){return cancelAnimationFrame(e)}:clearTimeout},Gn=typeof performance<"u"&&performance.now?function(){return performance.now()}:function(){return+new Date};function bu(){var e={"":0},t=[""];return{id:function(s){var y=e[s];return y||(y=e[s]=t.length,t.push(s),y)},str:function(s){return t[s]}}}function gu(e,t,s){var y=document.createElement("canvas");J(y.style,{border:0,margin:0,padding:0,top:0,left:0,width:"100%",height:"100%"}),e.appendChild(y),e===document.body&&(y.style.position="absolute",J(e.style,{margin:0,padding:0}));function L(){var D=window.innerWidth,F=window.innerHeight;if(e!==document.body){var N=y.getBoundingClientRect();D=N.right-N.left,F=N.bottom-N.top}y.width=s*D,y.height=s*F}var x;e!==document.body&&typeof ResizeObserver=="function"?(x=new ResizeObserver(function(){setTimeout(L)}),x.observe(e)):window.addEventListener("resize",L,!1);function A(){x?x.disconnect():window.removeEventListener("resize",L),e.removeChild(y)}return L(),{canvas:y,onDestroy:A}}function _u(e,t){function s(y){try{return e.getContext(y,t)}catch{return null}}return s("webgl")||s("experimental-webgl")||s("webgl-experimental")}function xu(e){return typeof e.nodeName=="string"&&typeof e.appendChild=="function"&&typeof e.getBoundingClientRect=="function"}function yu(e){return typeof e.drawArrays=="function"||typeof e.drawElements=="function"}function Fn(e){return typeof e=="string"?e.split():(n(Array.isArray(e),"invalid extension array"),e)}function Dn(e){return typeof e=="string"?(n(typeof document<"u","not supported outside of DOM"),document.querySelector(e)):e}function Eu(e){var t=e||{},s,y,L,x,A={},D=[],F=[],N=typeof window>"u"?1:window.devicePixelRatio,M=!1,P=function(B){B&&n.raise(B)},H=function(){};if(typeof t=="string"?(n(typeof document<"u","selector queries only supported in DOM environments"),s=document.querySelector(t),n(s,"invalid query string for element")):typeof t=="object"?xu(t)?s=t:yu(t)?(x=t,L=x.canvas):(n.constructor(t),"gl"in t?x=t.gl:"canvas"in t?L=Dn(t.canvas):"container"in t&&(y=Dn(t.container)),"attributes"in t&&(A=t.attributes,n.type(A,"object","invalid context attributes")),"extensions"in t&&(D=Fn(t.extensions)),"optionalExtensions"in t&&(F=Fn(t.optionalExtensions)),"onDone"in t&&(n.type(t.onDone,"function","invalid or missing onDone callback"),P=t.onDone),"profile"in t&&(M=!!t.profile),"pixelRatio"in t&&(N=+t.pixelRatio,n(N>0,"invalid pixel ratio"))):n.raise("invalid arguments to regl"),s&&(s.nodeName.toLowerCase()==="canvas"?L=s:y=s),!x){if(!L){n(typeof document<"u","must manually specify webgl context outside of DOM environments");var O=gu(y||document.body,P,N);if(!O)return null;L=O.canvas,H=O.onDestroy}A.premultipliedAlpha===void 0&&(A.premultipliedAlpha=!0),x=_u(L,A)}return x?{gl:x,canvas:L,container:y,extensions:D,optionalExtensions:F,pixelRatio:N,profile:M,onDone:P,onDestroy:H}:(H(),P("webgl not supported, try upgrading your browser or graphics drivers http://get.webgl.org"),null)}function Tu(e,t){var s={};function y(A){n.type(A,"string","extension name must be string");var D=A.toLowerCase(),F;try{F=s[D]=e.getExtension(D)}catch{}return!!F}for(var L=0;L<t.extensions.length;++L){var x=t.extensions[L];if(!y(x))return t.onDestroy(),t.onDone('"'+x+'" extension is not supported by the current WebGL context, try upgrading your system or a different browser'),null}return t.optionalExtensions.forEach(y),{extensions:s,restore:function(){Object.keys(s).forEach(function(A){if(s[A]&&!y(A))throw new Error("(regl): error restoring extension "+A)})}}}function tr(e,t){for(var s=Array(e),y=0;y<e;++y)s[y]=t(y);return s}var Au=5120,Su=5121,Lu=5122,Cu=5123,wu=5124,Ru=5125,Gu=5126;function Fu(e){for(var t=16;t<=1<<28;t*=16)if(e<=t)return t;return 0}function On(e){var t,s;return t=(e>65535)<<4,e>>>=t,s=(e>255)<<3,e>>>=s,t|=s,s=(e>15)<<2,e>>>=s,t|=s,s=(e>3)<<1,e>>>=s,t|=s,t|e>>1}function In(){var e=tr(8,function(){return[]});function t(x){var A=Fu(x),D=e[On(A)>>2];return D.length>0?D.pop():new ArrayBuffer(A)}function s(x){e[On(x.byteLength)>>2].push(x)}function y(x,A){var D=null;switch(x){case Au:D=new Int8Array(t(A),0,A);break;case Su:D=new Uint8Array(t(A),0,A);break;case Lu:D=new Int16Array(t(2*A),0,A);break;case Cu:D=new Uint16Array(t(2*A),0,A);break;case wu:D=new Int32Array(t(4*A),0,A);break;case Ru:D=new Uint32Array(t(4*A),0,A);break;case Gu:D=new Float32Array(t(4*A),0,A);break;default:return null}return D.length!==A?D.subarray(0,A):D}function L(x){s(x.buffer)}return{alloc:t,free:s,allocType:y,freeType:L}}var Be=In();Be.zero=In();var Du=3408,Ou=3410,Iu=3411,ku=3412,Bu=3413,Nu=3414,Pu=3415,Mu=33901,Uu=33902,Vu=3379,zu=3386,Hu=34921,ju=36347,Xu=36348,Wu=35661,$u=35660,qu=34930,Yu=36349,Qu=34076,Ku=34024,Zu=7936,Ju=7937,es=7938,rs=35724,ts=34047,as=36063,ns=34852,wt=3553,kn=34067,is=34069,os=33984,ot=6408,ha=5126,Bn=5121,pa=36160,us=36053,ss=36064,fs=16384,ls=function(e,t){var s=1;t.ext_texture_filter_anisotropic&&(s=e.getParameter(ts));var y=1,L=1;t.webgl_draw_buffers&&(y=e.getParameter(ns),L=e.getParameter(as));var x=!!t.oes_texture_float;if(x){var A=e.createTexture();e.bindTexture(wt,A),e.texImage2D(wt,0,ot,1,1,0,ot,ha,null);var D=e.createFramebuffer();if(e.bindFramebuffer(pa,D),e.framebufferTexture2D(pa,ss,wt,A,0),e.bindTexture(wt,null),e.checkFramebufferStatus(pa)!==us)x=!1;else{e.viewport(0,0,1,1),e.clearColor(1,0,0,1),e.clear(fs);var F=Be.allocType(ha,4);e.readPixels(0,0,1,1,ot,ha,F),e.getError()?x=!1:(e.deleteFramebuffer(D),e.deleteTexture(A),x=F[0]===1),Be.freeType(F)}}var N=typeof navigator<"u"&&(/MSIE/.test(navigator.userAgent)||/Trident\//.test(navigator.appVersion)||/Edge/.test(navigator.userAgent)),M=!0;if(!N){var P=e.createTexture(),H=Be.allocType(Bn,36);e.activeTexture(os),e.bindTexture(kn,P),e.texImage2D(is,0,ot,3,3,0,ot,Bn,H),Be.freeType(H),e.bindTexture(kn,null),e.deleteTexture(P),M=!e.getError()}return{colorBits:[e.getParameter(Ou),e.getParameter(Iu),e.getParameter(ku),e.getParameter(Bu)],depthBits:e.getParameter(Nu),stencilBits:e.getParameter(Pu),subpixelBits:e.getParameter(Du),extensions:Object.keys(t).filter(function(O){return!!t[O]}),maxAnisotropic:s,maxDrawbuffers:y,maxColorAttachments:L,pointSizeDims:e.getParameter(Mu),lineWidthDims:e.getParameter(Uu),maxViewportDims:e.getParameter(zu),maxCombinedTextureUnits:e.getParameter(Wu),maxCubeMapSize:e.getParameter(Qu),maxRenderbufferSize:e.getParameter(Ku),maxTextureUnits:e.getParameter(qu),maxTextureSize:e.getParameter(Vu),maxAttributes:e.getParameter(Hu),maxVertexUniforms:e.getParameter(ju),maxVertexTextureUnits:e.getParameter($u),maxVaryingVectors:e.getParameter(Xu),maxFragmentUniforms:e.getParameter(Yu),glsl:e.getParameter(rs),renderer:e.getParameter(Ju),vendor:e.getParameter(Zu),version:e.getParameter(es),readFloat:x,npotTextureCube:M}};function or(e){return!!e&&typeof e=="object"&&Array.isArray(e.shape)&&Array.isArray(e.stride)&&typeof e.offset=="number"&&e.shape.length===e.stride.length&&(Array.isArray(e.data)||G(e.data))}var ar=function(e){return Object.keys(e).map(function(t){return e[t]})},Rt={shape:vs,flatten:ds};function cs(e,t,s){for(var y=0;y<t;++y)s[y]=e[y]}function ms(e,t,s,y){for(var L=0,x=0;x<t;++x)for(var A=e[x],D=0;D<s;++D)y[L++]=A[D]}function Nn(e,t,s,y,L,x){for(var A=x,D=0;D<t;++D)for(var F=e[D],N=0;N<s;++N)for(var M=F[N],P=0;P<y;++P)L[A++]=M[P]}function Pn(e,t,s,y,L){for(var x=1,A=s+1;A<t.length;++A)x*=t[A];var D=t[s];if(t.length-s===4){var F=t[s+1],N=t[s+2],M=t[s+3];for(A=0;A<D;++A)Nn(e[A],F,N,M,y,L),L+=x}else for(A=0;A<D;++A)Pn(e[A],t,s+1,y,L),L+=x}function ds(e,t,s,y){var L=1;if(t.length)for(var x=0;x<t.length;++x)L*=t[x];else L=0;var A=y||Be.allocType(s,L);switch(t.length){case 0:break;case 1:cs(e,t[0],A);break;case 2:ms(e,t[0],t[1],A);break;case 3:Nn(e,t[0],t[1],t[2],A,0);break;default:Pn(e,t,0,A,0)}return A}function vs(e){for(var t=[],s=e;s.length;s=s[0])t.push(s.length);return t}var ba={"[object Int8Array]":5120,"[object Int16Array]":5122,"[object Int32Array]":5124,"[object Uint8Array]":5121,"[object Uint8ClampedArray]":5121,"[object Uint16Array]":5123,"[object Uint32Array]":5125,"[object Float32Array]":5126,"[object Float64Array]":5121,"[object ArrayBuffer]":5121},hs=5120,ps=5122,bs=5124,gs=5121,_s=5123,xs=5125,ys=5126,Es=5126,Gr={int8:hs,int16:ps,int32:bs,uint8:gs,uint16:_s,uint32:xs,float:ys,float32:Es},Ts=35048,As=35040,Gt={dynamic:Ts,stream:As,static:35044},ga=Rt.flatten,Mn=Rt.shape,Un=35044,Ss=35040,_a=5121,xa=5126,xr=[];xr[5120]=1,xr[5122]=2,xr[5124]=4,xr[5121]=1,xr[5123]=2,xr[5125]=4,xr[5126]=4;function Ft(e){return ba[Object.prototype.toString.call(e)]|0}function Vn(e,t){for(var s=0;s<t.length;++s)e[s]=t[s]}function zn(e,t,s,y,L,x,A){for(var D=0,F=0;F<s;++F)for(var N=0;N<y;++N)e[D++]=t[L*F+x*N+A]}function Ls(e,t,s,y){var L=0,x={};function A(h){this.id=L++,this.buffer=e.createBuffer(),this.type=h,this.usage=Un,this.byteLength=0,this.dimension=1,this.dtype=_a,this.persistentData=null,s.profile&&(this.stats={size:0})}A.prototype.bind=function(){e.bindBuffer(this.type,this.buffer)},A.prototype.destroy=function(){H(this)};var D=[];function F(h,T){var k=D.pop();return k||(k=new A(h)),k.bind(),P(k,T,Ss,0,1,!1),k}function N(h){D.push(h)}function M(h,T,k){h.byteLength=T.byteLength,e.bufferData(h.type,T,k)}function P(h,T,k,Z,R,Q){var $;if(h.usage=k,Array.isArray(T)){if(h.dtype=Z||xa,T.length>0){var se;if(Array.isArray(T[0])){$=Mn(T);for(var C=1,S=1;S<$.length;++S)C*=$[S];h.dimension=C,se=ga(T,$,h.dtype),M(h,se,k),Q?h.persistentData=se:Be.freeType(se)}else if(typeof T[0]=="number"){h.dimension=R;var ae=Be.allocType(h.dtype,T.length);Vn(ae,T),M(h,ae,k),Q?h.persistentData=ae:Be.freeType(ae)}else G(T[0])?(h.dimension=T[0].length,h.dtype=Z||Ft(T[0])||xa,se=ga(T,[T.length,T[0].length],h.dtype),M(h,se,k),Q?h.persistentData=se:Be.freeType(se)):n.raise("invalid buffer data")}}else if(G(T))h.dtype=Z||Ft(T),h.dimension=R,M(h,T,k),Q&&(h.persistentData=new Uint8Array(new Uint8Array(T.buffer)));else if(or(T)){$=T.shape;var j=T.stride,I=T.offset,X=0,W=0,_e=0,be=0;$.length===1?(X=$[0],W=1,_e=j[0],be=0):$.length===2?(X=$[0],W=$[1],_e=j[0],be=j[1]):n.raise("invalid shape"),h.dtype=Z||Ft(T.data)||xa,h.dimension=W;var q=Be.allocType(h.dtype,X*W);zn(q,T.data,X,W,_e,be,I),M(h,q,k),Q?h.persistentData=q:Be.freeType(q)}else T instanceof ArrayBuffer?(h.dtype=_a,h.dimension=R,M(h,T,k),Q&&(h.persistentData=new Uint8Array(new Uint8Array(T)))):n.raise("invalid buffer data")}function H(h){t.bufferCount--,y(h);var T=h.buffer;n(T,"buffer must not be deleted already"),e.deleteBuffer(T),h.buffer=null,delete x[h.id]}function O(h,T,k,Z){t.bufferCount++;var R=new A(T);x[R.id]=R;function Q(C){var S=Un,ae=null,j=0,I=0,X=1;return Array.isArray(C)||G(C)||or(C)||C instanceof ArrayBuffer?ae=C:typeof C=="number"?j=C|0:C&&(n.type(C,"object","buffer arguments must be an object, a number or an array"),"data"in C&&(n(ae===null||Array.isArray(ae)||G(ae)||or(ae),"invalid data for buffer"),ae=C.data),"usage"in C&&(n.parameter(C.usage,Gt,"invalid buffer usage"),S=Gt[C.usage]),"type"in C&&(n.parameter(C.type,Gr,"invalid buffer type"),I=Gr[C.type]),"dimension"in C&&(n.type(C.dimension,"number","invalid dimension"),X=C.dimension|0),"length"in C&&(n.nni(j,"buffer length must be a nonnegative integer"),j=C.length|0)),R.bind(),ae?P(R,ae,S,I,X,Z):(j&&e.bufferData(R.type,j,S),R.dtype=I||_a,R.usage=S,R.dimension=X,R.byteLength=j),s.profile&&(R.stats.size=R.byteLength*xr[R.dtype]),Q}function $(C,S){n(S+C.byteLength<=R.byteLength,"invalid buffer subdata call, buffer is too small.  Can't write data of size "+C.byteLength+" starting from offset "+S+" to a buffer of size "+R.byteLength),e.bufferSubData(R.type,S,C)}function se(C,S){var ae=(S||0)|0,j;if(R.bind(),G(C)||C instanceof ArrayBuffer)$(C,ae);else if(Array.isArray(C)){if(C.length>0)if(typeof C[0]=="number"){var I=Be.allocType(R.dtype,C.length);Vn(I,C),$(I,ae),Be.freeType(I)}else if(Array.isArray(C[0])||G(C[0])){j=Mn(C);var X=ga(C,j,R.dtype);$(X,ae),Be.freeType(X)}else n.raise("invalid buffer data")}else if(or(C)){j=C.shape;var W=C.stride,_e=0,be=0,q=0,K=0;j.length===1?(_e=j[0],be=1,q=W[0],K=0):j.length===2?(_e=j[0],be=j[1],q=W[0],K=W[1]):n.raise("invalid shape");var ve=Array.isArray(C.data)?R.dtype:Ft(C.data),ge=Be.allocType(ve,_e*be);zn(ge,C.data,_e,be,q,K,C.offset),$(ge,ae),Be.freeType(ge)}else n.raise("invalid data for buffer subdata");return Q}return k||Q(h),Q._reglType="buffer",Q._buffer=R,Q.subdata=se,s.profile&&(Q.stats=R.stats),Q.destroy=function(){H(R)},Q}function B(){ar(x).forEach(function(h){h.buffer=e.createBuffer(),e.bindBuffer(h.type,h.buffer),e.bufferData(h.type,h.persistentData||h.byteLength,h.usage)})}return s.profile&&(t.getTotalBufferSize=function(){var h=0;return Object.keys(x).forEach(function(T){h+=x[T].stats.size}),h}),{create:O,createStream:F,destroyStream:N,clear:function(){ar(x).forEach(H),D.forEach(H)},getBuffer:function(h){return h&&h._buffer instanceof A?h._buffer:null},restore:B,_initBuffer:P}}var Cs=0,ws=0,Rs=1,Gs=1,Fs=4,Ds=4,yr={points:Cs,point:ws,lines:Rs,line:Gs,triangles:Fs,triangle:Ds,"line loop":2,"line strip":3,"triangle strip":5,"triangle fan":6},Os=0,Is=1,ut=4,ks=5120,zr=5121,Hn=5122,Hr=5123,jn=5124,Fr=5125,ya=34963,Bs=35040,Ns=35044;function Ps(e,t,s,y){var L={},x=0,A={uint8:zr,uint16:Hr};t.oes_element_index_uint&&(A.uint32=Fr);function D(B){this.id=x++,L[this.id]=this,this.buffer=B,this.primType=ut,this.vertCount=0,this.type=0}D.prototype.bind=function(){this.buffer.bind()};var F=[];function N(B){var h=F.pop();return h||(h=new D(s.create(null,ya,!0,!1)._buffer)),P(h,B,Bs,-1,-1,0,0),h}function M(B){F.push(B)}function P(B,h,T,k,Z,R,Q){B.buffer.bind();var $;if(h){var se=Q;!Q&&(!G(h)||or(h)&&!G(h.data))&&(se=t.oes_element_index_uint?Fr:Hr),s._initBuffer(B.buffer,h,T,se,3)}else e.bufferData(ya,R,T),B.buffer.dtype=$||zr,B.buffer.usage=T,B.buffer.dimension=3,B.buffer.byteLength=R;if($=Q,!Q){switch(B.buffer.dtype){case zr:case ks:$=zr;break;case Hr:case Hn:$=Hr;break;case Fr:case jn:$=Fr;break;default:n.raise("unsupported type for element array")}B.buffer.dtype=$}B.type=$,n($!==Fr||!!t.oes_element_index_uint,"32 bit element buffers not supported, enable oes_element_index_uint first");var C=Z;C<0&&(C=B.buffer.byteLength,$===Hr?C>>=1:$===Fr&&(C>>=2)),B.vertCount=C;var S=k;if(k<0){S=ut;var ae=B.buffer.dimension;ae===1&&(S=Os),ae===2&&(S=Is),ae===3&&(S=ut)}B.primType=S}function H(B){y.elementsCount--,n(B.buffer!==null,"must not double destroy elements"),delete L[B.id],B.buffer.destroy(),B.buffer=null}function O(B,h){var T=s.create(null,ya,!0),k=new D(T._buffer);y.elementsCount++;function Z(R){if(!R)T(),k.primType=ut,k.vertCount=0,k.type=zr;else if(typeof R=="number")T(R),k.primType=ut,k.vertCount=R|0,k.type=zr;else{var Q=null,$=Ns,se=-1,C=-1,S=0,ae=0;Array.isArray(R)||G(R)||or(R)?Q=R:(n.type(R,"object","invalid arguments for elements"),"data"in R&&(Q=R.data,n(Array.isArray(Q)||G(Q)||or(Q),"invalid data for element buffer")),"usage"in R&&(n.parameter(R.usage,Gt,"invalid element buffer usage"),$=Gt[R.usage]),"primitive"in R&&(n.parameter(R.primitive,yr,"invalid element buffer primitive"),se=yr[R.primitive]),"count"in R&&(n(typeof R.count=="number"&&R.count>=0,"invalid vertex count for elements"),C=R.count|0),"type"in R&&(n.parameter(R.type,A,"invalid buffer type"),ae=A[R.type]),"length"in R?S=R.length|0:(S=C,ae===Hr||ae===Hn?S*=2:(ae===Fr||ae===jn)&&(S*=4))),P(k,Q,$,se,C,S,ae)}return Z}return Z(B),Z._reglType="elements",Z._elements=k,Z.subdata=function(R,Q){return T.subdata(R,Q),Z},Z.destroy=function(){H(k)},Z}return{create:O,createStream:N,destroyStream:M,getElements:function(B){return typeof B=="function"&&B._elements instanceof D?B._elements:null},clear:function(){ar(L).forEach(H)}}}var Xn=new Float32Array(1),Ms=new Uint32Array(Xn.buffer),Us=5123;function Wn(e){for(var t=Be.allocType(Us,e.length),s=0;s<e.length;++s)if(isNaN(e[s]))t[s]=65535;else if(e[s]===1/0)t[s]=31744;else if(e[s]===-1/0)t[s]=64512;else{Xn[0]=e[s];var y=Ms[0],L=y>>>31<<15,x=(y<<1>>>24)-127,A=y>>13&1023;if(x<-24)t[s]=L;else if(x<-14){var D=-14-x;t[s]=L+(A+1024>>D)}else x>15?t[s]=L+31744:t[s]=L+(x+15<<10)+A}return t}function Oe(e){return Array.isArray(e)||G(e)}var $n=function(e){return!(e&e-1)&&!!e},Vs=34467,fr=3553,Ea=34067,Dt=34069,Dr=6408,Ta=6406,Ot=6407,st=6409,It=6410,qn=32854,Aa=32855,Yn=36194,zs=32819,Hs=32820,js=33635,Xs=34042,Sa=6402,kt=34041,La=35904,Ca=35906,jr=36193,wa=33776,Ra=33777,Ga=33778,Fa=33779,Qn=35986,Kn=35987,Zn=34798,Jn=35840,ei=35841,ri=35842,ti=35843,ai=36196,Xr=5121,Da=5123,Oa=5125,ft=5126,Ws=10242,$s=10243,qs=10497,Ia=33071,Ys=33648,Qs=10240,Ks=10241,ka=9728,Zs=9729,Ba=9984,ni=9985,ii=9986,Na=9987,Js=33170,Bt=4352,ef=4353,rf=4354,tf=34046,af=3317,nf=37440,of=37441,uf=37443,oi=37444,lt=33984,sf=[Ba,ii,ni,Na],Nt=[0,st,It,Ot,Dr],nr={};nr[st]=nr[Ta]=nr[Sa]=1,nr[kt]=nr[It]=2,nr[Ot]=nr[La]=3,nr[Dr]=nr[Ca]=4;function Wr(e){return"[object "+e+"]"}var ui=Wr("HTMLCanvasElement"),si=Wr("OffscreenCanvas"),fi=Wr("CanvasRenderingContext2D"),li=Wr("ImageBitmap"),ci=Wr("HTMLImageElement"),mi=Wr("HTMLVideoElement"),ff=Object.keys(ba).concat([ui,si,fi,li,ci,mi]),$r=[];$r[Xr]=1,$r[ft]=4,$r[jr]=2,$r[Da]=2,$r[Oa]=4;var qe=[];qe[qn]=2,qe[Aa]=2,qe[Yn]=2,qe[kt]=4,qe[wa]=.5,qe[Ra]=.5,qe[Ga]=1,qe[Fa]=1,qe[Qn]=.5,qe[Kn]=1,qe[Zn]=1,qe[Jn]=.5,qe[ei]=.25,qe[ri]=.5,qe[ti]=.25,qe[ai]=.5;function di(e){return Array.isArray(e)&&(e.length===0||typeof e[0]=="number")}function vi(e){if(!Array.isArray(e))return!1;var t=e.length;return!(t===0||!Oe(e[0]))}function Or(e){return Object.prototype.toString.call(e)}function hi(e){return Or(e)===ui}function pi(e){return Or(e)===si}function lf(e){return Or(e)===fi}function cf(e){return Or(e)===li}function mf(e){return Or(e)===ci}function df(e){return Or(e)===mi}function Pa(e){if(!e)return!1;var t=Or(e);return ff.indexOf(t)>=0?!0:di(e)||vi(e)||or(e)}function bi(e){return ba[Object.prototype.toString.call(e)]|0}function vf(e,t){var s=t.length;switch(e.type){case Xr:case Da:case Oa:case ft:var y=Be.allocType(e.type,s);y.set(t),e.data=y;break;case jr:e.data=Wn(t);break;default:n.raise("unsupported texture type, must specify a typed array")}}function gi(e,t){return Be.allocType(e.type===jr?ft:e.type,t)}function _i(e,t){e.type===jr?(e.data=Wn(t),Be.freeType(t)):e.data=t}function hf(e,t,s,y,L,x){for(var A=e.width,D=e.height,F=e.channels,N=A*D*F,M=gi(e,N),P=0,H=0;H<D;++H)for(var O=0;O<A;++O)for(var B=0;B<F;++B)M[P++]=t[s*O+y*H+L*B+x];_i(e,M)}function Pt(e,t,s,y,L,x){var A;if(typeof qe[e]<"u"?A=qe[e]:A=nr[e]*$r[t],x&&(A*=6),L){for(var D=0,F=s;F>=1;)D+=A*F*F,F/=2;return D}else return A*s*y}function pf(e,t,s,y,L,x,A){var D={"don't care":Bt,"dont care":Bt,nice:rf,fast:ef},F={repeat:qs,clamp:Ia,mirror:Ys},N={nearest:ka,linear:Zs},M=J({mipmap:Na,"nearest mipmap nearest":Ba,"linear mipmap nearest":ni,"nearest mipmap linear":ii,"linear mipmap linear":Na},N),P={none:0,browser:oi},H={uint8:Xr,rgba4:zs,rgb565:js,"rgb5 a1":Hs},O={alpha:Ta,luminance:st,"luminance alpha":It,rgb:Ot,rgba:Dr,rgba4:qn,"rgb5 a1":Aa,rgb565:Yn},B={};t.ext_srgb&&(O.srgb=La,O.srgba=Ca),t.oes_texture_float&&(H.float32=H.float=ft),t.oes_texture_half_float&&(H.float16=H["half float"]=jr),t.webgl_depth_texture&&(J(O,{depth:Sa,"depth stencil":kt}),J(H,{uint16:Da,uint32:Oa,"depth stencil":Xs})),t.webgl_compressed_texture_s3tc&&J(B,{"rgb s3tc dxt1":wa,"rgba s3tc dxt1":Ra,"rgba s3tc dxt3":Ga,"rgba s3tc dxt5":Fa}),t.webgl_compressed_texture_atc&&J(B,{"rgb atc":Qn,"rgba atc explicit alpha":Kn,"rgba atc interpolated alpha":Zn}),t.webgl_compressed_texture_pvrtc&&J(B,{"rgb pvrtc 4bppv1":Jn,"rgb pvrtc 2bppv1":ei,"rgba pvrtc 4bppv1":ri,"rgba pvrtc 2bppv1":ti}),t.webgl_compressed_texture_etc1&&(B["rgb etc1"]=ai);var h=Array.prototype.slice.call(e.getParameter(Vs));Object.keys(B).forEach(function(u){var E=B[u];h.indexOf(E)>=0&&(O[u]=E)});var T=Object.keys(O);s.textureFormats=T;var k=[];Object.keys(O).forEach(function(u){var E=O[u];k[E]=u});var Z=[];Object.keys(H).forEach(function(u){var E=H[u];Z[E]=u});var R=[];Object.keys(N).forEach(function(u){var E=N[u];R[E]=u});var Q=[];Object.keys(M).forEach(function(u){var E=M[u];Q[E]=u});var $=[];Object.keys(F).forEach(function(u){var E=F[u];$[E]=u});var se=T.reduce(function(u,E){var _=O[E];return _===st||_===Ta||_===st||_===It||_===Sa||_===kt||t.ext_srgb&&(_===La||_===Ca)?u[_]=_:_===Aa||E.indexOf("rgba")>=0?u[_]=Dr:u[_]=Ot,u},{});function C(){this.internalformat=Dr,this.format=Dr,this.type=Xr,this.compressed=!1,this.premultiplyAlpha=!1,this.flipY=!1,this.unpackAlignment=1,this.colorSpace=oi,this.width=0,this.height=0,this.channels=0}function S(u,E){u.internalformat=E.internalformat,u.format=E.format,u.type=E.type,u.compressed=E.compressed,u.premultiplyAlpha=E.premultiplyAlpha,u.flipY=E.flipY,u.unpackAlignment=E.unpackAlignment,u.colorSpace=E.colorSpace,u.width=E.width,u.height=E.height,u.channels=E.channels}function ae(u,E){if(!(typeof E!="object"||!E)){if("premultiplyAlpha"in E&&(n.type(E.premultiplyAlpha,"boolean","invalid premultiplyAlpha"),u.premultiplyAlpha=E.premultiplyAlpha),"flipY"in E&&(n.type(E.flipY,"boolean","invalid texture flip"),u.flipY=E.flipY),"alignment"in E&&(n.oneOf(E.alignment,[1,2,4,8],"invalid texture unpack alignment"),u.unpackAlignment=E.alignment),"colorSpace"in E&&(n.parameter(E.colorSpace,P,"invalid colorSpace"),u.colorSpace=P[E.colorSpace]),"type"in E){var _=E.type;n(t.oes_texture_float||!(_==="float"||_==="float32"),"you must enable the OES_texture_float extension in order to use floating point textures."),n(t.oes_texture_half_float||!(_==="half float"||_==="float16"),"you must enable the OES_texture_half_float extension in order to use 16-bit floating point textures."),n(t.webgl_depth_texture||!(_==="uint16"||_==="uint32"||_==="depth stencil"),"you must enable the WEBGL_depth_texture extension in order to use depth/stencil textures."),n.parameter(_,H,"invalid texture type"),u.type=H[_]}var te=u.width,ye=u.height,i=u.channels,r=!1;"shape"in E?(n(Array.isArray(E.shape)&&E.shape.length>=2,"shape must be an array"),te=E.shape[0],ye=E.shape[1],E.shape.length===3&&(i=E.shape[2],n(i>0&&i<=4,"invalid number of channels"),r=!0),n(te>=0&&te<=s.maxTextureSize,"invalid width"),n(ye>=0&&ye<=s.maxTextureSize,"invalid height")):("radius"in E&&(te=ye=E.radius,n(te>=0&&te<=s.maxTextureSize,"invalid radius")),"width"in E&&(te=E.width,n(te>=0&&te<=s.maxTextureSize,"invalid width")),"height"in E&&(ye=E.height,n(ye>=0&&ye<=s.maxTextureSize,"invalid height")),"channels"in E&&(i=E.channels,n(i>0&&i<=4,"invalid number of channels"),r=!0)),u.width=te|0,u.height=ye|0,u.channels=i|0;var l=!1;if("format"in E){var v=E.format;n(t.webgl_depth_texture||!(v==="depth"||v==="depth stencil"),"you must enable the WEBGL_depth_texture extension in order to use depth/stencil textures."),n.parameter(v,O,"invalid texture format");var p=u.internalformat=O[v];u.format=se[p],v in H&&("type"in E||(u.type=H[v])),v in B&&(u.compressed=!0),l=!0}!r&&l?u.channels=nr[u.format]:r&&!l?u.channels!==Nt[u.format]&&(u.format=u.internalformat=Nt[u.channels]):l&&r&&n(u.channels===nr[u.format],"number of channels inconsistent with specified format")}}function j(u){e.pixelStorei(nf,u.flipY),e.pixelStorei(of,u.premultiplyAlpha),e.pixelStorei(uf,u.colorSpace),e.pixelStorei(af,u.unpackAlignment)}function I(){C.call(this),this.xOffset=0,this.yOffset=0,this.data=null,this.needsFree=!1,this.element=null,this.needsCopy=!1}function X(u,E){var _=null;if(Pa(E)?_=E:E&&(n.type(E,"object","invalid pixel data type"),ae(u,E),"x"in E&&(u.xOffset=E.x|0),"y"in E&&(u.yOffset=E.y|0),Pa(E.data)&&(_=E.data)),n(!u.compressed||_ instanceof Uint8Array,"compressed texture data must be stored in a uint8array"),E.copy){n(!_,"can not specify copy and data field for the same texture");var te=L.viewportWidth,ye=L.viewportHeight;u.width=u.width||te-u.xOffset,u.height=u.height||ye-u.yOffset,u.needsCopy=!0,n(u.xOffset>=0&&u.xOffset<te&&u.yOffset>=0&&u.yOffset<ye&&u.width>0&&u.width<=te&&u.height>0&&u.height<=ye,"copy texture read out of bounds")}else if(!_)u.width=u.width||1,u.height=u.height||1,u.channels=u.channels||4;else if(G(_))u.channels=u.channels||4,u.data=_,!("type"in E)&&u.type===Xr&&(u.type=bi(_));else if(di(_))u.channels=u.channels||4,vf(u,_),u.alignment=1,u.needsFree=!0;else if(or(_)){var i=_.data;!Array.isArray(i)&&u.type===Xr&&(u.type=bi(i));var r=_.shape,l=_.stride,v,p,m,c,d,a;r.length===3?(m=r[2],a=l[2]):(n(r.length===2,"invalid ndarray pixel data, must be 2 or 3D"),m=1,a=1),v=r[0],p=r[1],c=l[0],d=l[1],u.alignment=1,u.width=v,u.height=p,u.channels=m,u.format=u.internalformat=Nt[m],u.needsFree=!0,hf(u,i,c,d,a,_.offset)}else if(hi(_)||pi(_)||lf(_))hi(_)||pi(_)?u.element=_:u.element=_.canvas,u.width=u.element.width,u.height=u.element.height,u.channels=4;else if(cf(_))u.element=_,u.width=_.width,u.height=_.height,u.channels=4;else if(mf(_))u.element=_,u.width=_.naturalWidth,u.height=_.naturalHeight,u.channels=4;else if(df(_))u.element=_,u.width=_.videoWidth,u.height=_.videoHeight,u.channels=4;else if(vi(_)){var f=u.width||_[0].length,o=u.height||_.length,b=u.channels;Oe(_[0][0])?b=b||_[0][0].length:b=b||1;for(var g=Rt.shape(_),w=1,V=0;V<g.length;++V)w*=g[V];var z=gi(u,w);Rt.flatten(_,g,"",z),_i(u,z),u.alignment=1,u.width=f,u.height=o,u.channels=b,u.format=u.internalformat=Nt[b],u.needsFree=!0}u.type===ft?n(s.extensions.indexOf("oes_texture_float")>=0,"oes_texture_float extension not enabled"):u.type===jr&&n(s.extensions.indexOf("oes_texture_half_float")>=0,"oes_texture_half_float extension not enabled")}function W(u,E,_){var te=u.element,ye=u.data,i=u.internalformat,r=u.format,l=u.type,v=u.width,p=u.height;j(u),te?e.texImage2D(E,_,r,r,l,te):u.compressed?e.compressedTexImage2D(E,_,i,v,p,0,ye):u.needsCopy?(y(),e.copyTexImage2D(E,_,r,u.xOffset,u.yOffset,v,p,0)):e.texImage2D(E,_,r,v,p,0,r,l,ye||null)}function _e(u,E,_,te,ye){var i=u.element,r=u.data,l=u.internalformat,v=u.format,p=u.type,m=u.width,c=u.height;j(u),i?e.texSubImage2D(E,ye,_,te,v,p,i):u.compressed?e.compressedTexSubImage2D(E,ye,_,te,l,m,c,r):u.needsCopy?(y(),e.copyTexSubImage2D(E,ye,_,te,u.xOffset,u.yOffset,m,c)):e.texSubImage2D(E,ye,_,te,m,c,v,p,r)}var be=[];function q(){return be.pop()||new I}function K(u){u.needsFree&&Be.freeType(u.data),I.call(u),be.push(u)}function ve(){C.call(this),this.genMipmaps=!1,this.mipmapHint=Bt,this.mipmask=0,this.images=Array(16)}function ge(u,E,_){var te=u.images[0]=q();u.mipmask=1,te.width=u.width=E,te.height=u.height=_,te.channels=u.channels=4}function Ee(u,E){var _=null;if(Pa(E))_=u.images[0]=q(),S(_,u),X(_,E),u.mipmask=1;else if(ae(u,E),Array.isArray(E.mipmap))for(var te=E.mipmap,ye=0;ye<te.length;++ye)_=u.images[ye]=q(),S(_,u),_.width>>=ye,_.height>>=ye,X(_,te[ye]),u.mipmask|=1<<ye;else _=u.images[0]=q(),S(_,u),X(_,E),u.mipmask=1;S(u,u.images[0]),u.compressed&&(u.internalformat===wa||u.internalformat===Ra||u.internalformat===Ga||u.internalformat===Fa)&&n(u.width%4===0&&u.height%4===0,"for compressed texture formats, mipmap level 0 must have width and height that are a multiple of 4")}function Fe(u,E){for(var _=u.images,te=0;te<_.length;++te){if(!_[te])return;W(_[te],E,te)}}var De=[];function Ae(){var u=De.pop()||new ve;C.call(u),u.mipmask=0;for(var E=0;E<16;++E)u.images[E]=null;return u}function Ue(u){for(var E=u.images,_=0;_<E.length;++_)E[_]&&K(E[_]),E[_]=null;De.push(u)}function Ge(){this.minFilter=ka,this.magFilter=ka,this.wrapS=Ia,this.wrapT=Ia,this.anisotropic=1,this.genMipmaps=!1,this.mipmapHint=Bt}function Pe(u,E){if("min"in E){var _=E.min;n.parameter(_,M),u.minFilter=M[_],sf.indexOf(u.minFilter)>=0&&!("faces"in E)&&(u.genMipmaps=!0)}if("mag"in E){var te=E.mag;n.parameter(te,N),u.magFilter=N[te]}var ye=u.wrapS,i=u.wrapT;if("wrap"in E){var r=E.wrap;typeof r=="string"?(n.parameter(r,F),ye=i=F[r]):Array.isArray(r)&&(n.parameter(r[0],F),n.parameter(r[1],F),ye=F[r[0]],i=F[r[1]])}else{if("wrapS"in E){var l=E.wrapS;n.parameter(l,F),ye=F[l]}if("wrapT"in E){var v=E.wrapT;n.parameter(v,F),i=F[v]}}if(u.wrapS=ye,u.wrapT=i,"anisotropic"in E){var p=E.anisotropic;n(typeof p=="number"&&p>=1&&p<=s.maxAnisotropic,"aniso samples must be between 1 and "),u.anisotropic=E.anisotropic}if("mipmap"in E){var m=!1;switch(typeof E.mipmap){case"string":n.parameter(E.mipmap,D,"invalid mipmap hint"),u.mipmapHint=D[E.mipmap],u.genMipmaps=!0,m=!0;break;case"boolean":m=u.genMipmaps=E.mipmap;break;case"object":n(Array.isArray(E.mipmap),"invalid mipmap type"),u.genMipmaps=!1,m=!0;break;default:n.raise("invalid mipmap type")}m&&!("min"in E)&&(u.minFilter=Ba)}}function Ve(u,E){e.texParameteri(E,Ks,u.minFilter),e.texParameteri(E,Qs,u.magFilter),e.texParameteri(E,Ws,u.wrapS),e.texParameteri(E,$s,u.wrapT),t.ext_texture_filter_anisotropic&&e.texParameteri(E,tf,u.anisotropic),u.genMipmaps&&(e.hint(Js,u.mipmapHint),e.generateMipmap(E))}var ze=0,Xe={},Ye=s.maxTextureUnits,Ie=Array(Ye).map(function(){return null});function xe(u){C.call(this),this.mipmask=0,this.internalformat=Dr,this.id=ze++,this.refCount=1,this.target=u,this.texture=e.createTexture(),this.unit=-1,this.bindCount=0,this.texInfo=new Ge,A.profile&&(this.stats={size:0})}function Qe(u){e.activeTexture(lt),e.bindTexture(u.target,u.texture)}function we(){var u=Ie[0];u?e.bindTexture(u.target,u.texture):e.bindTexture(fr,null)}function me(u){var E=u.texture;n(E,"must not double destroy texture");var _=u.unit,te=u.target;_>=0&&(e.activeTexture(lt+_),e.bindTexture(te,null),Ie[_]=null),e.deleteTexture(E),u.texture=null,u.params=null,u.pixels=null,u.refCount=0,delete Xe[u.id],x.textureCount--}J(xe.prototype,{bind:function(){var u=this;u.bindCount+=1;var E=u.unit;if(E<0){for(var _=0;_<Ye;++_){var te=Ie[_];if(te){if(te.bindCount>0)continue;te.unit=-1}Ie[_]=u,E=_;break}E>=Ye&&n.raise("insufficient number of texture units"),A.profile&&x.maxTextureUnits<E+1&&(x.maxTextureUnits=E+1),u.unit=E,e.activeTexture(lt+E),e.bindTexture(u.target,u.texture)}return E},unbind:function(){this.bindCount-=1},decRef:function(){--this.refCount<=0&&me(this)}});function Te(u,E){var _=new xe(fr);Xe[_.id]=_,x.textureCount++;function te(r,l){var v=_.texInfo;Ge.call(v);var p=Ae();return typeof r=="number"?typeof l=="number"?ge(p,r|0,l|0):ge(p,r|0,r|0):r?(n.type(r,"object","invalid arguments to regl.texture"),Pe(v,r),Ee(p,r)):ge(p,1,1),v.genMipmaps&&(p.mipmask=(p.width<<1)-1),_.mipmask=p.mipmask,S(_,p),n.texture2D(v,p,s),_.internalformat=p.internalformat,te.width=p.width,te.height=p.height,Qe(_),Fe(p,fr),Ve(v,fr),we(),Ue(p),A.profile&&(_.stats.size=Pt(_.internalformat,_.type,p.width,p.height,v.genMipmaps,!1)),te.format=k[_.internalformat],te.type=Z[_.type],te.mag=R[v.magFilter],te.min=Q[v.minFilter],te.wrapS=$[v.wrapS],te.wrapT=$[v.wrapT],te}function ye(r,l,v,p){n(!!r,"must specify image data");var m=l|0,c=v|0,d=p|0,a=q();return S(a,_),a.width=0,a.height=0,X(a,r),a.width=a.width||(_.width>>d)-m,a.height=a.height||(_.height>>d)-c,n(_.type===a.type&&_.format===a.format&&_.internalformat===a.internalformat,"incompatible format for texture.subimage"),n(m>=0&&c>=0&&m+a.width<=_.width&&c+a.height<=_.height,"texture.subimage write out of bounds"),n(_.mipmask&1<<d,"missing mipmap data"),n(a.data||a.element||a.needsCopy,"missing image data"),Qe(_),_e(a,fr,m,c,d),we(),K(a),te}function i(r,l){var v=r|0,p=l|0||v;if(v===_.width&&p===_.height)return te;te.width=_.width=v,te.height=_.height=p,Qe(_);for(var m=0;_.mipmask>>m;++m){var c=v>>m,d=p>>m;if(!c||!d)break;e.texImage2D(fr,m,_.format,c,d,0,_.format,_.type,null)}return we(),A.profile&&(_.stats.size=Pt(_.internalformat,_.type,v,p,!1,!1)),te}return te(u,E),te.subimage=ye,te.resize=i,te._reglType="texture2d",te._texture=_,A.profile&&(te.stats=_.stats),te.destroy=function(){_.decRef()},te}function Le(u,E,_,te,ye,i){var r=new xe(Ea);Xe[r.id]=r,x.cubeCount++;var l=new Array(6);function v(c,d,a,f,o,b){var g,w=r.texInfo;for(Ge.call(w),g=0;g<6;++g)l[g]=Ae();if(typeof c=="number"||!c){var V=c|0||1;for(g=0;g<6;++g)ge(l[g],V,V)}else if(typeof c=="object")if(d)Ee(l[0],c),Ee(l[1],d),Ee(l[2],a),Ee(l[3],f),Ee(l[4],o),Ee(l[5],b);else if(Pe(w,c),ae(r,c),"faces"in c){var z=c.faces;for(n(Array.isArray(z)&&z.length===6,"cube faces must be a length 6 array"),g=0;g<6;++g)n(typeof z[g]=="object"&&!!z[g],"invalid input for cube map face"),S(l[g],r),Ee(l[g],z[g])}else for(g=0;g<6;++g)Ee(l[g],c);else n.raise("invalid arguments to cube map");for(S(r,l[0]),n.optional(function(){s.npotTextureCube||n($n(r.width)&&$n(r.height),"your browser does not support non power or two texture dimensions")}),w.genMipmaps?r.mipmask=(l[0].width<<1)-1:r.mipmask=l[0].mipmask,n.textureCube(r,w,l,s),r.internalformat=l[0].internalformat,v.width=l[0].width,v.height=l[0].height,Qe(r),g=0;g<6;++g)Fe(l[g],Dt+g);for(Ve(w,Ea),we(),A.profile&&(r.stats.size=Pt(r.internalformat,r.type,v.width,v.height,w.genMipmaps,!0)),v.format=k[r.internalformat],v.type=Z[r.type],v.mag=R[w.magFilter],v.min=Q[w.minFilter],v.wrapS=$[w.wrapS],v.wrapT=$[w.wrapT],g=0;g<6;++g)Ue(l[g]);return v}function p(c,d,a,f,o){n(!!d,"must specify image data"),n(typeof c=="number"&&c===(c|0)&&c>=0&&c<6,"invalid face");var b=a|0,g=f|0,w=o|0,V=q();return S(V,r),V.width=0,V.height=0,X(V,d),V.width=V.width||(r.width>>w)-b,V.height=V.height||(r.height>>w)-g,n(r.type===V.type&&r.format===V.format&&r.internalformat===V.internalformat,"incompatible format for texture.subimage"),n(b>=0&&g>=0&&b+V.width<=r.width&&g+V.height<=r.height,"texture.subimage write out of bounds"),n(r.mipmask&1<<w,"missing mipmap data"),n(V.data||V.element||V.needsCopy,"missing image data"),Qe(r),_e(V,Dt+c,b,g,w),we(),K(V),v}function m(c){var d=c|0;if(d!==r.width){v.width=r.width=d,v.height=r.height=d,Qe(r);for(var a=0;a<6;++a)for(var f=0;r.mipmask>>f;++f)e.texImage2D(Dt+a,f,r.format,d>>f,d>>f,0,r.format,r.type,null);return we(),A.profile&&(r.stats.size=Pt(r.internalformat,r.type,v.width,v.height,!1,!0)),v}}return v(u,E,_,te,ye,i),v.subimage=p,v.resize=m,v._reglType="textureCube",v._texture=r,A.profile&&(v.stats=r.stats),v.destroy=function(){r.decRef()},v}function ke(){for(var u=0;u<Ye;++u)e.activeTexture(lt+u),e.bindTexture(fr,null),Ie[u]=null;ar(Xe).forEach(me),x.cubeCount=0,x.textureCount=0}A.profile&&(x.getTotalTextureSize=function(){var u=0;return Object.keys(Xe).forEach(function(E){u+=Xe[E].stats.size}),u});function cr(){for(var u=0;u<Ye;++u){var E=Ie[u];E&&(E.bindCount=0,E.unit=-1,Ie[u]=null)}ar(Xe).forEach(function(_){_.texture=e.createTexture(),e.bindTexture(_.target,_.texture);for(var te=0;te<32;++te)if(_.mipmask&1<<te)if(_.target===fr)e.texImage2D(fr,te,_.internalformat,_.width>>te,_.height>>te,0,_.internalformat,_.type,null);else for(var ye=0;ye<6;++ye)e.texImage2D(Dt+ye,te,_.internalformat,_.width>>te,_.height>>te,0,_.internalformat,_.type,null);Ve(_.texInfo,_.target)})}function Ur(){for(var u=0;u<Ye;++u){var E=Ie[u];E&&(E.bindCount=0,E.unit=-1,Ie[u]=null),e.activeTexture(lt+u),e.bindTexture(fr,null),e.bindTexture(Ea,null)}}return{create2D:Te,createCube:Le,clear:ke,getTexture:function(u){return null},restore:cr,refresh:Ur}}var Er=36161,Mt=32854,xi=32855,yi=36194,Ei=33189,Ti=36168,Ai=34041,Si=35907,Li=34836,Ci=34842,wi=34843,ur=[];ur[Mt]=2,ur[xi]=2,ur[yi]=2,ur[Ei]=2,ur[Ti]=1,ur[Ai]=4,ur[Si]=4,ur[Li]=16,ur[Ci]=8,ur[wi]=6;function Ri(e,t,s){return ur[e]*t*s}var bf=function(e,t,s,y,L){var x={rgba4:Mt,rgb565:yi,"rgb5 a1":xi,depth:Ei,stencil:Ti,"depth stencil":Ai};t.ext_srgb&&(x.srgba=Si),t.ext_color_buffer_half_float&&(x.rgba16f=Ci,x.rgb16f=wi),t.webgl_color_buffer_float&&(x.rgba32f=Li);var A=[];Object.keys(x).forEach(function(O){var B=x[O];A[B]=O});var D=0,F={};function N(O){this.id=D++,this.refCount=1,this.renderbuffer=O,this.format=Mt,this.width=0,this.height=0,L.profile&&(this.stats={size:0})}N.prototype.decRef=function(){--this.refCount<=0&&M(this)};function M(O){var B=O.renderbuffer;n(B,"must not double destroy renderbuffer"),e.bindRenderbuffer(Er,null),e.deleteRenderbuffer(B),O.renderbuffer=null,O.refCount=0,delete F[O.id],y.renderbufferCount--}function P(O,B){var h=new N(e.createRenderbuffer());F[h.id]=h,y.renderbufferCount++;function T(Z,R){var Q=0,$=0,se=Mt;if(typeof Z=="object"&&Z){var C=Z;if("shape"in C){var S=C.shape;n(Array.isArray(S)&&S.length>=2,"invalid renderbuffer shape"),Q=S[0]|0,$=S[1]|0}else"radius"in C&&(Q=$=C.radius|0),"width"in C&&(Q=C.width|0),"height"in C&&($=C.height|0);"format"in C&&(n.parameter(C.format,x,"invalid renderbuffer format"),se=x[C.format])}else typeof Z=="number"?(Q=Z|0,typeof R=="number"?$=R|0:$=Q):Z?n.raise("invalid arguments to renderbuffer constructor"):Q=$=1;if(n(Q>0&&$>0&&Q<=s.maxRenderbufferSize&&$<=s.maxRenderbufferSize,"invalid renderbuffer size"),!(Q===h.width&&$===h.height&&se===h.format))return T.width=h.width=Q,T.height=h.height=$,h.format=se,e.bindRenderbuffer(Er,h.renderbuffer),e.renderbufferStorage(Er,se,Q,$),n(e.getError()===0,"invalid render buffer format"),L.profile&&(h.stats.size=Ri(h.format,h.width,h.height)),T.format=A[h.format],T}function k(Z,R){var Q=Z|0,$=R|0||Q;return Q===h.width&&$===h.height||(n(Q>0&&$>0&&Q<=s.maxRenderbufferSize&&$<=s.maxRenderbufferSize,"invalid renderbuffer size"),T.width=h.width=Q,T.height=h.height=$,e.bindRenderbuffer(Er,h.renderbuffer),e.renderbufferStorage(Er,h.format,Q,$),n(e.getError()===0,"invalid render buffer format"),L.profile&&(h.stats.size=Ri(h.format,h.width,h.height))),T}return T(O,B),T.resize=k,T._reglType="renderbuffer",T._renderbuffer=h,L.profile&&(T.stats=h.stats),T.destroy=function(){h.decRef()},T}L.profile&&(y.getTotalRenderbufferSize=function(){var O=0;return Object.keys(F).forEach(function(B){O+=F[B].stats.size}),O});function H(){ar(F).forEach(function(O){O.renderbuffer=e.createRenderbuffer(),e.bindRenderbuffer(Er,O.renderbuffer),e.renderbufferStorage(Er,O.format,O.width,O.height)}),e.bindRenderbuffer(Er,null)}return{create:P,clear:function(){ar(F).forEach(M)},restore:H}},dr=36160,Ma=36161,Ir=3553,Ut=34069,Gi=36064,Fi=36096,Di=36128,Oi=33306,Ii=36053,gf=36054,_f=36055,xf=36057,yf=36061,Ef=36193,Tf=5121,Af=5126,ki=6407,Bi=6408,Sf=6402,Lf=[ki,Bi],Ua=[];Ua[Bi]=4,Ua[ki]=3;var Vt=[];Vt[Tf]=1,Vt[Af]=4,Vt[Ef]=2;var Cf=32854,wf=32855,Rf=36194,Gf=33189,Ff=36168,Ni=34041,Df=35907,Of=34836,If=34842,kf=34843,Bf=[Cf,wf,Rf,Df,If,kf,Of],qr={};qr[Ii]="complete",qr[gf]="incomplete attachment",qr[xf]="incomplete dimensions",qr[_f]="incomplete, missing attachment",qr[yf]="unsupported";function Nf(e,t,s,y,L,x){var A={cur:null,next:null,dirty:!1,setFBO:null},D=["rgba"],F=["rgba4","rgb565","rgb5 a1"];t.ext_srgb&&F.push("srgba"),t.ext_color_buffer_half_float&&F.push("rgba16f","rgb16f"),t.webgl_color_buffer_float&&F.push("rgba32f");var N=["uint8"];t.oes_texture_half_float&&N.push("half float","float16"),t.oes_texture_float&&N.push("float","float32");function M(I,X,W){this.target=I,this.texture=X,this.renderbuffer=W;var _e=0,be=0;X?(_e=X.width,be=X.height):W&&(_e=W.width,be=W.height),this.width=_e,this.height=be}function P(I){I&&(I.texture&&I.texture._texture.decRef(),I.renderbuffer&&I.renderbuffer._renderbuffer.decRef())}function H(I,X,W){if(I)if(I.texture){var _e=I.texture._texture,be=Math.max(1,_e.width),q=Math.max(1,_e.height);n(be===X&&q===W,"inconsistent width/height for supplied texture"),_e.refCount+=1}else{var K=I.renderbuffer._renderbuffer;n(K.width===X&&K.height===W,"inconsistent width/height for renderbuffer"),K.refCount+=1}}function O(I,X){X&&(X.texture?e.framebufferTexture2D(dr,I,X.target,X.texture._texture.texture,0):e.framebufferRenderbuffer(dr,I,Ma,X.renderbuffer._renderbuffer.renderbuffer))}function B(I){var X=Ir,W=null,_e=null,be=I;typeof I=="object"&&(be=I.data,"target"in I&&(X=I.target|0)),n.type(be,"function","invalid attachment data");var q=be._reglType;return q==="texture2d"?(W=be,n(X===Ir)):q==="textureCube"?(W=be,n(X>=Ut&&X<Ut+6,"invalid cube map target")):q==="renderbuffer"?(_e=be,X=Ma):n.raise("invalid regl object for attachment"),new M(X,W,_e)}function h(I,X,W,_e,be){if(W){var q=y.create2D({width:I,height:X,format:_e,type:be});return q._texture.refCount=0,new M(Ir,q,null)}else{var K=L.create({width:I,height:X,format:_e});return K._renderbuffer.refCount=0,new M(Ma,null,K)}}function T(I){return I&&(I.texture||I.renderbuffer)}function k(I,X,W){I&&(I.texture?I.texture.resize(X,W):I.renderbuffer&&I.renderbuffer.resize(X,W),I.width=X,I.height=W)}var Z=0,R={};function Q(){this.id=Z++,R[this.id]=this,this.framebuffer=e.createFramebuffer(),this.width=0,this.height=0,this.colorAttachments=[],this.depthAttachment=null,this.stencilAttachment=null,this.depthStencilAttachment=null}function $(I){I.colorAttachments.forEach(P),P(I.depthAttachment),P(I.stencilAttachment),P(I.depthStencilAttachment)}function se(I){var X=I.framebuffer;n(X,"must not double destroy framebuffer"),e.deleteFramebuffer(X),I.framebuffer=null,x.framebufferCount--,delete R[I.id]}function C(I){var X;e.bindFramebuffer(dr,I.framebuffer);var W=I.colorAttachments;for(X=0;X<W.length;++X)O(Gi+X,W[X]);for(X=W.length;X<s.maxColorAttachments;++X)e.framebufferTexture2D(dr,Gi+X,Ir,null,0);e.framebufferTexture2D(dr,Oi,Ir,null,0),e.framebufferTexture2D(dr,Fi,Ir,null,0),e.framebufferTexture2D(dr,Di,Ir,null,0),O(Fi,I.depthAttachment),O(Di,I.stencilAttachment),O(Oi,I.depthStencilAttachment);var _e=e.checkFramebufferStatus(dr);!e.isContextLost()&&_e!==Ii&&n.raise("framebuffer configuration not supported, status = "+qr[_e]),e.bindFramebuffer(dr,A.next?A.next.framebuffer:null),A.cur=A.next,e.getError()}function S(I,X){var W=new Q;x.framebufferCount++;function _e(q,K){var ve;n(A.next!==W,"can not update framebuffer which is currently in use");var ge=0,Ee=0,Fe=!0,De=!0,Ae=null,Ue=!0,Ge="rgba",Pe="uint8",Ve=1,ze=null,Xe=null,Ye=null,Ie=!1;if(typeof q=="number")ge=q|0,Ee=K|0||ge;else if(!q)ge=Ee=1;else{n.type(q,"object","invalid arguments for framebuffer");var xe=q;if("shape"in xe){var Qe=xe.shape;n(Array.isArray(Qe)&&Qe.length>=2,"invalid shape for framebuffer"),ge=Qe[0],Ee=Qe[1]}else"radius"in xe&&(ge=Ee=xe.radius),"width"in xe&&(ge=xe.width),"height"in xe&&(Ee=xe.height);("color"in xe||"colors"in xe)&&(Ae=xe.color||xe.colors,Array.isArray(Ae)&&n(Ae.length===1||t.webgl_draw_buffers,"multiple render targets not supported")),Ae||("colorCount"in xe&&(Ve=xe.colorCount|0,n(Ve>0,"invalid color buffer count")),"colorTexture"in xe&&(Ue=!!xe.colorTexture,Ge="rgba4"),"colorType"in xe&&(Pe=xe.colorType,Ue?(n(t.oes_texture_float||!(Pe==="float"||Pe==="float32"),"you must enable OES_texture_float in order to use floating point framebuffer objects"),n(t.oes_texture_half_float||!(Pe==="half float"||Pe==="float16"),"you must enable OES_texture_half_float in order to use 16-bit floating point framebuffer objects")):Pe==="half float"||Pe==="float16"?(n(t.ext_color_buffer_half_float,"you must enable EXT_color_buffer_half_float to use 16-bit render buffers"),Ge="rgba16f"):(Pe==="float"||Pe==="float32")&&(n(t.webgl_color_buffer_float,"you must enable WEBGL_color_buffer_float in order to use 32-bit floating point renderbuffers"),Ge="rgba32f"),n.oneOf(Pe,N,"invalid color type")),"colorFormat"in xe&&(Ge=xe.colorFormat,D.indexOf(Ge)>=0?Ue=!0:F.indexOf(Ge)>=0?Ue=!1:n.optional(function(){Ue?n.oneOf(xe.colorFormat,D,"invalid color format for texture"):n.oneOf(xe.colorFormat,F,"invalid color format for renderbuffer")}))),("depthTexture"in xe||"depthStencilTexture"in xe)&&(Ie=!!(xe.depthTexture||xe.depthStencilTexture),n(!Ie||t.webgl_depth_texture,"webgl_depth_texture extension not supported")),"depth"in xe&&(typeof xe.depth=="boolean"?Fe=xe.depth:(ze=xe.depth,De=!1)),"stencil"in xe&&(typeof xe.stencil=="boolean"?De=xe.stencil:(Xe=xe.stencil,Fe=!1)),"depthStencil"in xe&&(typeof xe.depthStencil=="boolean"?Fe=De=xe.depthStencil:(Ye=xe.depthStencil,Fe=!1,De=!1))}var we=null,me=null,Te=null,Le=null;if(Array.isArray(Ae))we=Ae.map(B);else if(Ae)we=[B(Ae)];else for(we=new Array(Ve),ve=0;ve<Ve;++ve)we[ve]=h(ge,Ee,Ue,Ge,Pe);n(t.webgl_draw_buffers||we.length<=1,"you must enable the WEBGL_draw_buffers extension in order to use multiple color buffers."),n(we.length<=s.maxColorAttachments,"too many color attachments, not supported"),ge=ge||we[0].width,Ee=Ee||we[0].height,ze?me=B(ze):Fe&&!De&&(me=h(ge,Ee,Ie,"depth","uint32")),Xe?Te=B(Xe):De&&!Fe&&(Te=h(ge,Ee,!1,"stencil","uint8")),Ye?Le=B(Ye):!ze&&!Xe&&De&&Fe&&(Le=h(ge,Ee,Ie,"depth stencil","depth stencil")),n(!!ze+!!Xe+!!Ye<=1,"invalid framebuffer configuration, can specify exactly one depth/stencil attachment");var ke=null;for(ve=0;ve<we.length;++ve)if(H(we[ve],ge,Ee),n(!we[ve]||we[ve].texture&&Lf.indexOf(we[ve].texture._texture.format)>=0||we[ve].renderbuffer&&Bf.indexOf(we[ve].renderbuffer._renderbuffer.format)>=0,"framebuffer color attachment "+ve+" is invalid"),we[ve]&&we[ve].texture){var cr=Ua[we[ve].texture._texture.format]*Vt[we[ve].texture._texture.type];ke===null?ke=cr:n(ke===cr,"all color attachments much have the same number of bits per pixel.")}return H(me,ge,Ee),n(!me||me.texture&&me.texture._texture.format===Sf||me.renderbuffer&&me.renderbuffer._renderbuffer.format===Gf,"invalid depth attachment for framebuffer object"),H(Te,ge,Ee),n(!Te||Te.renderbuffer&&Te.renderbuffer._renderbuffer.format===Ff,"invalid stencil attachment for framebuffer object"),H(Le,ge,Ee),n(!Le||Le.texture&&Le.texture._texture.format===Ni||Le.renderbuffer&&Le.renderbuffer._renderbuffer.format===Ni,"invalid depth-stencil attachment for framebuffer object"),$(W),W.width=ge,W.height=Ee,W.colorAttachments=we,W.depthAttachment=me,W.stencilAttachment=Te,W.depthStencilAttachment=Le,_e.color=we.map(T),_e.depth=T(me),_e.stencil=T(Te),_e.depthStencil=T(Le),_e.width=W.width,_e.height=W.height,C(W),_e}function be(q,K){n(A.next!==W,"can not resize a framebuffer which is currently in use");var ve=Math.max(q|0,1),ge=Math.max(K|0||ve,1);if(ve===W.width&&ge===W.height)return _e;for(var Ee=W.colorAttachments,Fe=0;Fe<Ee.length;++Fe)k(Ee[Fe],ve,ge);return k(W.depthAttachment,ve,ge),k(W.stencilAttachment,ve,ge),k(W.depthStencilAttachment,ve,ge),W.width=_e.width=ve,W.height=_e.height=ge,C(W),_e}return _e(I,X),J(_e,{resize:be,_reglType:"framebuffer",_framebuffer:W,destroy:function(){se(W),$(W)},use:function(q){A.setFBO({framebuffer:_e},q)}})}function ae(I){var X=Array(6);function W(be){var q;n(X.indexOf(A.next)<0,"can not update framebuffer which is currently in use");var K={color:null},ve=0,ge=null,Ee="rgba",Fe="uint8",De=1;if(typeof be=="number")ve=be|0;else if(!be)ve=1;else{n.type(be,"object","invalid arguments for framebuffer");var Ae=be;if("shape"in Ae){var Ue=Ae.shape;n(Array.isArray(Ue)&&Ue.length>=2,"invalid shape for framebuffer"),n(Ue[0]===Ue[1],"cube framebuffer must be square"),ve=Ue[0]}else"radius"in Ae&&(ve=Ae.radius|0),"width"in Ae?(ve=Ae.width|0,"height"in Ae&&n(Ae.height===ve,"must be square")):"height"in Ae&&(ve=Ae.height|0);("color"in Ae||"colors"in Ae)&&(ge=Ae.color||Ae.colors,Array.isArray(ge)&&n(ge.length===1||t.webgl_draw_buffers,"multiple render targets not supported")),ge||("colorCount"in Ae&&(De=Ae.colorCount|0,n(De>0,"invalid color buffer count")),"colorType"in Ae&&(n.oneOf(Ae.colorType,N,"invalid color type"),Fe=Ae.colorType),"colorFormat"in Ae&&(Ee=Ae.colorFormat,n.oneOf(Ae.colorFormat,D,"invalid color format for texture"))),"depth"in Ae&&(K.depth=Ae.depth),"stencil"in Ae&&(K.stencil=Ae.stencil),"depthStencil"in Ae&&(K.depthStencil=Ae.depthStencil)}var Ge;if(ge)if(Array.isArray(ge))for(Ge=[],q=0;q<ge.length;++q)Ge[q]=ge[q];else Ge=[ge];else{Ge=Array(De);var Pe={radius:ve,format:Ee,type:Fe};for(q=0;q<De;++q)Ge[q]=y.createCube(Pe)}for(K.color=Array(Ge.length),q=0;q<Ge.length;++q){var Ve=Ge[q];n(typeof Ve=="function"&&Ve._reglType==="textureCube","invalid cube map"),ve=ve||Ve.width,n(Ve.width===ve&&Ve.height===ve,"invalid cube map shape"),K.color[q]={target:Ut,data:Ge[q]}}for(q=0;q<6;++q){for(var ze=0;ze<Ge.length;++ze)K.color[ze].target=Ut+q;q>0&&(K.depth=X[0].depth,K.stencil=X[0].stencil,K.depthStencil=X[0].depthStencil),X[q]?X[q](K):X[q]=S(K)}return J(W,{width:ve,height:ve,color:Ge})}function _e(be){var q,K=be|0;if(n(K>0&&K<=s.maxCubeMapSize,"invalid radius for cube fbo"),K===W.width)return W;var ve=W.color;for(q=0;q<ve.length;++q)ve[q].resize(K);for(q=0;q<6;++q)X[q].resize(K);return W.width=W.height=K,W}return W(I),J(W,{faces:X,resize:_e,_reglType:"framebufferCube",destroy:function(){X.forEach(function(be){be.destroy()})}})}function j(){A.cur=null,A.next=null,A.dirty=!0,ar(R).forEach(function(I){I.framebuffer=e.createFramebuffer(),C(I)})}return J(A,{getFramebuffer:function(I){if(typeof I=="function"&&I._reglType==="framebuffer"){var X=I._framebuffer;if(X instanceof Q)return X}return null},create:S,createCube:ae,clear:function(){ar(R).forEach(se)},restore:j})}var Pf=5126,Pi=34962,zt=34963,Mi=["attributes","elements","offset","count","primitive","instances"];function Va(){this.state=0,this.x=0,this.y=0,this.z=0,this.w=0,this.buffer=null,this.size=0,this.normalized=!1,this.type=Pf,this.offset=0,this.stride=0,this.divisor=0}function Mf(e,t,s,y,L,x,A){for(var D=s.maxAttributes,F=new Array(D),N=0;N<D;++N)F[N]=new Va;var M=0,P={},H={Record:Va,scope:{},state:F,currentVAO:null,targetVAO:null,restore:B()?$:function(){},createVAO:se,getVAO:T,destroyBuffer:O,setVAO:B()?k:Z,clear:B()?R:function(){}};function O(C){for(var S=0;S<F.length;++S){var ae=F[S];ae.buffer===C&&(e.disableVertexAttribArray(S),ae.buffer=null)}}function B(){return t.oes_vertex_array_object}function h(){return t.angle_instanced_arrays}function T(C){return typeof C=="function"&&C._vao?C._vao:null}function k(C){if(C!==H.currentVAO){var S=B();C?S.bindVertexArrayOES(C.vao):S.bindVertexArrayOES(null),H.currentVAO=C}}function Z(C){if(C!==H.currentVAO){if(C)C.bindAttrs();else{for(var S=h(),ae=0;ae<F.length;++ae){var j=F[ae];j.buffer?(e.enableVertexAttribArray(ae),j.buffer.bind(),e.vertexAttribPointer(ae,j.size,j.type,j.normalized,j.stride,j.offfset),S&&j.divisor&&S.vertexAttribDivisorANGLE(ae,j.divisor)):(e.disableVertexAttribArray(ae),e.vertexAttrib4f(ae,j.x,j.y,j.z,j.w))}A.elements?e.bindBuffer(zt,A.elements.buffer.buffer):e.bindBuffer(zt,null)}H.currentVAO=C}}function R(){ar(P).forEach(function(C){C.destroy()})}function Q(){this.id=++M,this.attributes=[],this.elements=null,this.ownsElements=!1,this.count=0,this.offset=0,this.instances=-1,this.primitive=4;var C=B();C?this.vao=C.createVertexArrayOES():this.vao=null,P[this.id]=this,this.buffers=[]}Q.prototype.bindAttrs=function(){for(var C=h(),S=this.attributes,ae=0;ae<S.length;++ae){var j=S[ae];j.buffer?(e.enableVertexAttribArray(ae),e.bindBuffer(Pi,j.buffer.buffer),e.vertexAttribPointer(ae,j.size,j.type,j.normalized,j.stride,j.offset),C&&j.divisor&&C.vertexAttribDivisorANGLE(ae,j.divisor)):(e.disableVertexAttribArray(ae),e.vertexAttrib4f(ae,j.x,j.y,j.z,j.w))}for(var I=S.length;I<D;++I)e.disableVertexAttribArray(I);var X=x.getElements(this.elements);X?e.bindBuffer(zt,X.buffer.buffer):e.bindBuffer(zt,null)},Q.prototype.refresh=function(){var C=B();C&&(C.bindVertexArrayOES(this.vao),this.bindAttrs(),H.currentVAO=null,C.bindVertexArrayOES(null))},Q.prototype.destroy=function(){if(this.vao){var C=B();this===H.currentVAO&&(H.currentVAO=null,C.bindVertexArrayOES(null)),C.deleteVertexArrayOES(this.vao),this.vao=null}this.ownsElements&&(this.elements.destroy(),this.elements=null,this.ownsElements=!1),P[this.id]&&(delete P[this.id],y.vaoCount-=1)};function $(){var C=B();C&&ar(P).forEach(function(S){S.refresh()})}function se(C){var S=new Q;y.vaoCount+=1;function ae(j){var I;if(Array.isArray(j))I=j,S.elements&&S.ownsElements&&S.elements.destroy(),S.elements=null,S.ownsElements=!1,S.offset=0,S.count=0,S.instances=-1,S.primitive=4;else{if(n(typeof j=="object","invalid arguments for create vao"),n("attributes"in j,"must specify attributes for vao"),j.elements){var X=j.elements;S.ownsElements?typeof X=="function"&&X._reglType==="elements"?(S.elements.destroy(),S.ownsElements=!1):(S.elements(X),S.ownsElements=!1):x.getElements(j.elements)?(S.elements=j.elements,S.ownsElements=!1):(S.elements=x.create(j.elements),S.ownsElements=!0)}else S.elements=null,S.ownsElements=!1;I=j.attributes,S.offset=0,S.count=-1,S.instances=-1,S.primitive=4,S.elements&&(S.count=S.elements._elements.vertCount,S.primitive=S.elements._elements.primType),"offset"in j&&(S.offset=j.offset|0),"count"in j&&(S.count=j.count|0),"instances"in j&&(S.instances=j.instances|0),"primitive"in j&&(n(j.primitive in yr,"bad primitive type: "+j.primitive),S.primitive=yr[j.primitive]),n.optional(()=>{for(var Fe=Object.keys(j),De=0;De<Fe.length;++De)n(Mi.indexOf(Fe[De])>=0,'invalid option for vao: "'+Fe[De]+'" valid options are '+Mi)}),n(Array.isArray(I),"attributes must be an array")}n(I.length<D,"too many attributes"),n(I.length>0,"must specify at least one attribute");var W={},_e=S.attributes;_e.length=I.length;for(var be=0;be<I.length;++be){var q=I[be],K=_e[be]=new Va,ve=q.data||q;if(Array.isArray(ve)||G(ve)||or(ve)){var ge;S.buffers[be]&&(ge=S.buffers[be],G(ve)&&ge._buffer.byteLength>=ve.byteLength?ge.subdata(ve):(ge.destroy(),S.buffers[be]=null)),S.buffers[be]||(ge=S.buffers[be]=L.create(q,Pi,!1,!0)),K.buffer=L.getBuffer(ge),K.size=K.buffer.dimension|0,K.normalized=!1,K.type=K.buffer.dtype,K.offset=0,K.stride=0,K.divisor=0,K.state=1,W[be]=1}else L.getBuffer(q)?(K.buffer=L.getBuffer(q),K.size=K.buffer.dimension|0,K.normalized=!1,K.type=K.buffer.dtype,K.offset=0,K.stride=0,K.divisor=0,K.state=1):L.getBuffer(q.buffer)?(K.buffer=L.getBuffer(q.buffer),K.size=(+q.size||K.buffer.dimension)|0,K.normalized=!!q.normalized||!1,"type"in q?(n.parameter(q.type,Gr,"invalid buffer type"),K.type=Gr[q.type]):K.type=K.buffer.dtype,K.offset=(q.offset||0)|0,K.stride=(q.stride||0)|0,K.divisor=(q.divisor||0)|0,K.state=1,n(K.size>=1&&K.size<=4,"size must be between 1 and 4"),n(K.offset>=0,"invalid offset"),n(K.stride>=0&&K.stride<=255,"stride must be between 0 and 255"),n(K.divisor>=0,"divisor must be positive"),n(!K.divisor||!!t.angle_instanced_arrays,"ANGLE_instanced_arrays must be enabled to use divisor")):"x"in q?(n(be>0,"first attribute must not be a constant"),K.x=+q.x||0,K.y=+q.y||0,K.z=+q.z||0,K.w=+q.w||0,K.state=2):n(!1,"invalid attribute spec for location "+be)}for(var Ee=0;Ee<S.buffers.length;++Ee)!W[Ee]&&S.buffers[Ee]&&(S.buffers[Ee].destroy(),S.buffers[Ee]=null);return S.refresh(),ae}return ae.destroy=function(){for(var j=0;j<S.buffers.length;++j)S.buffers[j]&&S.buffers[j].destroy();S.buffers.length=0,S.ownsElements&&(S.elements.destroy(),S.elements=null,S.ownsElements=!1),S.destroy()},ae._vao=S,ae._reglType="vao",ae(C)}return H}var Ui=35632,Uf=35633,Vf=35718,zf=35721;function Hf(e,t,s,y){var L={},x={};function A(h,T,k,Z){this.name=h,this.id=T,this.location=k,this.info=Z}function D(h,T){for(var k=0;k<h.length;++k)if(h[k].id===T.id){h[k].location=T.location;return}h.push(T)}function F(h,T,k){var Z=h===Ui?L:x,R=Z[T];if(!R){var Q=t.str(T);R=e.createShader(h),e.shaderSource(R,Q),e.compileShader(R),n.shaderError(e,R,Q,h,k),Z[T]=R}return R}var N={},M=[],P=0;function H(h,T){this.id=P++,this.fragId=h,this.vertId=T,this.program=null,this.uniforms=[],this.attributes=[],this.refCount=1,y.profile&&(this.stats={uniformsCount:0,attributesCount:0})}function O(h,T,k){var Z,R,Q=F(Ui,h.fragId),$=F(Uf,h.vertId),se=h.program=e.createProgram();if(e.attachShader(se,Q),e.attachShader(se,$),k)for(Z=0;Z<k.length;++Z){var C=k[Z];e.bindAttribLocation(se,C[0],C[1])}e.linkProgram(se),n.linkError(e,se,t.str(h.fragId),t.str(h.vertId),T);var S=e.getProgramParameter(se,Vf);y.profile&&(h.stats.uniformsCount=S);var ae=h.uniforms;for(Z=0;Z<S;++Z)if(R=e.getActiveUniform(se,Z),R)if(R.size>1)for(var j=0;j<R.size;++j){var I=R.name.replace("[0]","["+j+"]");D(ae,new A(I,t.id(I),e.getUniformLocation(se,I),R))}else D(ae,new A(R.name,t.id(R.name),e.getUniformLocation(se,R.name),R));var X=e.getProgramParameter(se,zf);y.profile&&(h.stats.attributesCount=X);var W=h.attributes;for(Z=0;Z<X;++Z)R=e.getActiveAttrib(se,Z),R&&D(W,new A(R.name,t.id(R.name),e.getAttribLocation(se,R.name),R))}y.profile&&(s.getMaxUniformsCount=function(){var h=0;return M.forEach(function(T){T.stats.uniformsCount>h&&(h=T.stats.uniformsCount)}),h},s.getMaxAttributesCount=function(){var h=0;return M.forEach(function(T){T.stats.attributesCount>h&&(h=T.stats.attributesCount)}),h});function B(){L={},x={};for(var h=0;h<M.length;++h)O(M[h],null,M[h].attributes.map(function(T){return[T.location,T.name]}))}return{clear:function(){var h=e.deleteShader.bind(e);ar(L).forEach(h),L={},ar(x).forEach(h),x={},M.forEach(function(T){e.deleteProgram(T.program)}),M.length=0,N={},s.shaderCount=0},program:function(h,T,k,Z){n.command(h>=0,"missing vertex shader",k),n.command(T>=0,"missing fragment shader",k);var R=N[T];R||(R=N[T]={});var Q=R[h];if(Q&&(Q.refCount++,!Z))return Q;var $=new H(T,h);return s.shaderCount++,O($,k,Z),Q||(R[h]=$),M.push($),J($,{destroy:function(){if($.refCount--,$.refCount<=0){e.deleteProgram($.program);var se=M.indexOf($);M.splice(se,1),s.shaderCount--}R[$.vertId].refCount<=0&&(e.deleteShader(x[$.vertId]),delete x[$.vertId],delete N[$.fragId][$.vertId]),Object.keys(N[$.fragId]).length||(e.deleteShader(L[$.fragId]),delete L[$.fragId],delete N[$.fragId])}})},restore:B,shader:F,frag:-1,vert:-1}}var jf=6408,ct=5121,Xf=3333,Ht=5126;function Wf(e,t,s,y,L,x,A){function D(M){var P;t.next===null?(n(L.preserveDrawingBuffer,'you must create a webgl context with "preserveDrawingBuffer":true in order to read pixels from the drawing buffer'),P=ct):(n(t.next.colorAttachments[0].texture!==null,"You cannot read from a renderbuffer"),P=t.next.colorAttachments[0].texture._texture.type,n.optional(function(){x.oes_texture_float?(n(P===ct||P===Ht,"Reading from a framebuffer is only allowed for the types 'uint8' and 'float'"),P===Ht&&n(A.readFloat,"Reading 'float' values is not permitted in your browser. For a fallback, please see: https://www.npmjs.com/package/glsl-read-float")):n(P===ct,"Reading from a framebuffer is only allowed for the type 'uint8'")}));var H=0,O=0,B=y.framebufferWidth,h=y.framebufferHeight,T=null;G(M)?T=M:M&&(n.type(M,"object","invalid arguments to regl.read()"),H=M.x|0,O=M.y|0,n(H>=0&&H<y.framebufferWidth,"invalid x offset for regl.read"),n(O>=0&&O<y.framebufferHeight,"invalid y offset for regl.read"),B=(M.width||y.framebufferWidth-H)|0,h=(M.height||y.framebufferHeight-O)|0,T=M.data||null),T&&(P===ct?n(T instanceof Uint8Array,"buffer must be 'Uint8Array' when reading from a framebuffer of type 'uint8'"):P===Ht&&n(T instanceof Float32Array,"buffer must be 'Float32Array' when reading from a framebuffer of type 'float'")),n(B>0&&B+H<=y.framebufferWidth,"invalid width for read pixels"),n(h>0&&h+O<=y.framebufferHeight,"invalid height for read pixels"),s();var k=B*h*4;return T||(P===ct?T=new Uint8Array(k):P===Ht&&(T=T||new Float32Array(k))),n.isTypedArray(T,"data buffer for regl.read() must be a typedarray"),n(T.byteLength>=k,"data buffer for regl.read() too small"),e.pixelStorei(Xf,4),e.readPixels(H,O,B,h,jf,P,T),T}function F(M){var P;return t.setFBO({framebuffer:M.framebuffer},function(){P=D(M)}),P}function N(M){return!M||!("framebuffer"in M)?D(M):F(M)}return N}function Yr(e){return Array.prototype.slice.call(e)}function Qr(e){return Yr(e).join("")}function $f(){var e=0,t=[],s=[];function y(P){for(var H=0;H<s.length;++H)if(s[H]===P)return t[H];var O="g"+e++;return t.push(O),s.push(P),O}function L(){var P=[];function H(){P.push.apply(P,Yr(arguments))}var O=[];function B(){var h="v"+e++;return O.push(h),arguments.length>0&&(P.push(h,"="),P.push.apply(P,Yr(arguments)),P.push(";")),h}return J(H,{def:B,toString:function(){return Qr([O.length>0?"var "+O.join(",")+";":"",Qr(P)])}})}function x(){var P=L(),H=L(),O=P.toString,B=H.toString;function h(T,k){H(T,k,"=",P.def(T,k),";")}return J(function(){P.apply(P,Yr(arguments))},{def:P.def,entry:P,exit:H,save:h,set:function(T,k,Z){h(T,k),P(T,k,"=",Z,";")},toString:function(){return O()+B()}})}function A(){var P=Qr(arguments),H=x(),O=x(),B=H.toString,h=O.toString;return J(H,{then:function(){return H.apply(H,Yr(arguments)),this},else:function(){return O.apply(O,Yr(arguments)),this},toString:function(){var T=h();return T&&(T="else{"+T+"}"),Qr(["if(",P,"){",B(),"}",T])}})}var D=L(),F={};function N(P,H){var O=[];function B(){var R="a"+O.length;return O.push(R),R}H=H||0;for(var h=0;h<H;++h)B();var T=x(),k=T.toString,Z=F[P]=J(T,{arg:B,toString:function(){return Qr(["function(",O.join(),"){",k(),"}"])}});return Z}function M(){var P=['"use strict";',D,"return {"];Object.keys(F).forEach(function(B){P.push('"',B,'":',F[B].toString(),",")}),P.push("}");var H=Qr(P).replace(/;/g,`;
`).replace(/}/g,`}
`).replace(/{/g,`{
`),O=Function.apply(null,t.concat(H));return O.apply(null,s)}return{global:D,link:y,block:L,proc:N,scope:x,cond:A,compile:M}}var Kr="xyzw".split(""),Vi=5121,Zr=1,za=2,Ha=0,ja=1,Xa=2,Wa=3,jt=4,zi=5,Hi=6,ji="dither",Xi="blend.enable",Wi="blend.color",$a="blend.equation",qa="blend.func",$i="depth.enable",qi="depth.func",Yi="depth.range",Qi="depth.mask",Ya="colorMask",Ki="cull.enable",Zi="cull.face",Qa="frontFace",Ka="lineWidth",Ji="polygonOffset.enable",Za="polygonOffset.offset",eo="sample.alpha",ro="sample.enable",Ja="sample.coverage",to="stencil.enable",ao="stencil.mask",en="stencil.func",rn="stencil.opFront",mt="stencil.opBack",no="scissor.enable",Xt="scissor.box",vr="viewport",dt="profile",kr="framebuffer",vt="vert",ht="frag",Br="elements",Nr="primitive",Pr="count",Wt="offset",$t="instances",pt="vao",tn="Width",an="Height",Jr=kr+tn,et=kr+an,qf=vr+tn,Yf=vr+an,io="drawingBuffer",oo=io+tn,uo=io+an,Qf=[qa,$a,en,rn,mt,Ja,vr,Xt,Za],rt=34962,nn=34963,Kf=35632,Zf=35633,so=3553,Jf=34067,el=2884,rl=3042,tl=3024,al=2960,nl=2929,il=3089,ol=32823,ul=32926,sl=32928,on=5126,qt=35664,Yt=35665,Qt=35666,un=5124,Kt=35667,Zt=35668,Jt=35669,sn=35670,ea=35671,ra=35672,ta=35673,bt=35674,gt=35675,_t=35676,xt=35678,yt=35680,fn=4,Et=1028,Mr=1029,fo=2304,ln=2305,fl=32775,ll=32776,cl=519,Tr=7680,lo=0,co=1,mo=32774,ml=513,vo=36160,dl=36064,lr={0:0,1:1,zero:0,one:1,"src color":768,"one minus src color":769,"src alpha":770,"one minus src alpha":771,"dst color":774,"one minus dst color":775,"dst alpha":772,"one minus dst alpha":773,"constant color":32769,"one minus constant color":32770,"constant alpha":32771,"one minus constant alpha":32772,"src alpha saturate":776},ho=["constant color, constant alpha","one minus constant color, constant alpha","constant color, one minus constant alpha","one minus constant color, one minus constant alpha","constant alpha, constant color","constant alpha, one minus constant color","one minus constant alpha, constant color","one minus constant alpha, one minus constant color"],tt={never:512,less:513,"<":513,equal:514,"=":514,"==":514,"===":514,lequal:515,"<=":515,greater:516,">":516,notequal:517,"!=":517,"!==":517,gequal:518,">=":518,always:519},Ar={0:0,zero:0,keep:7680,replace:7681,increment:7682,decrement:7683,"increment wrap":34055,"decrement wrap":34056,invert:5386},po={frag:Kf,vert:Zf},cn={cw:fo,ccw:ln};function aa(e){return Array.isArray(e)||G(e)||or(e)}function bo(e){return e.sort(function(t,s){return t===vr?-1:s===vr?1:t<s?-1:1})}function He(e,t,s,y){this.thisDep=e,this.contextDep=t,this.propDep=s,this.append=y}function Sr(e){return e&&!(e.thisDep||e.contextDep||e.propDep)}function Ne(e){return new He(!1,!1,!1,e)}function Je(e,t){var s=e.type;if(s===Ha){var y=e.data.length;return new He(!0,y>=1,y>=2,t)}else if(s===jt){var L=e.data;return new He(L.thisDep,L.contextDep,L.propDep,t)}else{if(s===zi)return new He(!1,!1,!1,t);if(s===Hi){for(var x=!1,A=!1,D=!1,F=0;F<e.data.length;++F){var N=e.data[F];if(N.type===ja)D=!0;else if(N.type===Xa)A=!0;else if(N.type===Wa)x=!0;else if(N.type===Ha){x=!0;var M=N.data;M>=1&&(A=!0),M>=2&&(D=!0)}else N.type===jt&&(x=x||N.data.thisDep,A=A||N.data.contextDep,D=D||N.data.propDep)}return new He(x,A,D,t)}else return new He(s===Wa,s===Xa,s===ja,t)}}var go=new He(!1,!1,!1,function(){});function vl(e,t,s,y,L,x,A,D,F,N,M,P,H,O,B){var h=N.Record,T={add:32774,subtract:32778,"reverse subtract":32779};s.ext_blend_minmax&&(T.min=fl,T.max=ll);var k=s.angle_instanced_arrays,Z=s.webgl_draw_buffers,R=s.oes_vertex_array_object,Q={dirty:!0,profile:B.profile},$={},se=[],C={},S={};function ae(i){return i.replace(".","_")}function j(i,r,l){var v=ae(i);se.push(i),$[v]=Q[v]=!!l,C[v]=r}function I(i,r,l){var v=ae(i);se.push(i),Array.isArray(l)?(Q[v]=l.slice(),$[v]=l.slice()):Q[v]=$[v]=l,S[v]=r}j(ji,tl),j(Xi,rl),I(Wi,"blendColor",[0,0,0,0]),I($a,"blendEquationSeparate",[mo,mo]),I(qa,"blendFuncSeparate",[co,lo,co,lo]),j($i,nl,!0),I(qi,"depthFunc",ml),I(Yi,"depthRange",[0,1]),I(Qi,"depthMask",!0),I(Ya,Ya,[!0,!0,!0,!0]),j(Ki,el),I(Zi,"cullFace",Mr),I(Qa,Qa,ln),I(Ka,Ka,1),j(Ji,ol),I(Za,"polygonOffset",[0,0]),j(eo,ul),j(ro,sl),I(Ja,"sampleCoverage",[1,!1]),j(to,al),I(ao,"stencilMask",-1),I(en,"stencilFunc",[cl,0,-1]),I(rn,"stencilOpSeparate",[Et,Tr,Tr,Tr]),I(mt,"stencilOpSeparate",[Mr,Tr,Tr,Tr]),j(no,il),I(Xt,"scissor",[0,0,e.drawingBufferWidth,e.drawingBufferHeight]),I(vr,vr,[0,0,e.drawingBufferWidth,e.drawingBufferHeight]);var X={gl:e,context:H,strings:t,next:$,current:Q,draw:P,elements:x,buffer:L,shader:M,attributes:N.state,vao:N,uniforms:F,framebuffer:D,extensions:s,timer:O,isBufferArgs:aa},W={primTypes:yr,compareFuncs:tt,blendFuncs:lr,blendEquations:T,stencilOps:Ar,glTypes:Gr,orientationType:cn};n.optional(function(){X.isArrayLike=Oe}),Z&&(W.backBuffer=[Mr],W.drawBuffer=tr(y.maxDrawbuffers,function(i){return i===0?[0]:tr(i,function(r){return dl+r})}));var _e=0;function be(){var i=$f(),r=i.link,l=i.global;i.id=_e++,i.batchId="0";var v=r(X),p=i.shared={props:"a0"};Object.keys(X).forEach(function(f){p[f]=l.def(v,".",f)}),n.optional(function(){i.CHECK=r(n),i.commandStr=n.guessCommand(),i.command=r(i.commandStr),i.assert=function(f,o,b){f("if(!(",o,"))",this.CHECK,".commandRaise(",r(b),",",this.command,");")},W.invalidBlendCombinations=ho});var m=i.next={},c=i.current={};Object.keys(S).forEach(function(f){Array.isArray(Q[f])&&(m[f]=l.def(p.next,".",f),c[f]=l.def(p.current,".",f))});var d=i.constants={};Object.keys(W).forEach(function(f){d[f]=l.def(JSON.stringify(W[f]))}),i.invoke=function(f,o){switch(o.type){case Ha:var b=["this",p.context,p.props,i.batchId];return f.def(r(o.data),".call(",b.slice(0,Math.max(o.data.length+1,4)),")");case ja:return f.def(p.props,o.data);case Xa:return f.def(p.context,o.data);case Wa:return f.def("this",o.data);case jt:return o.data.append(i,f),o.data.ref;case zi:return o.data.toString();case Hi:return o.data.map(function(g){return i.invoke(f,g)})}},i.attribCache={};var a={};return i.scopeAttrib=function(f){var o=t.id(f);if(o in a)return a[o];var b=N.scope[o];b||(b=N.scope[o]=new h);var g=a[o]=r(b);return g},i}function q(i){var r=i.static,l=i.dynamic,v;if(dt in r){var p=!!r[dt];v=Ne(function(c,d){return p}),v.enable=p}else if(dt in l){var m=l[dt];v=Je(m,function(c,d){return c.invoke(d,m)})}return v}function K(i,r){var l=i.static,v=i.dynamic;if(kr in l){var p=l[kr];return p?(p=D.getFramebuffer(p),n.command(p,"invalid framebuffer object"),Ne(function(c,d){var a=c.link(p),f=c.shared;d.set(f.framebuffer,".next",a);var o=f.context;return d.set(o,"."+Jr,a+".width"),d.set(o,"."+et,a+".height"),a})):Ne(function(c,d){var a=c.shared;d.set(a.framebuffer,".next","null");var f=a.context;return d.set(f,"."+Jr,f+"."+oo),d.set(f,"."+et,f+"."+uo),"null"})}else if(kr in v){var m=v[kr];return Je(m,function(c,d){var a=c.invoke(d,m),f=c.shared,o=f.framebuffer,b=d.def(o,".getFramebuffer(",a,")");n.optional(function(){c.assert(d,"!"+a+"||"+b,"invalid framebuffer object")}),d.set(o,".next",b);var g=f.context;return d.set(g,"."+Jr,b+"?"+b+".width:"+g+"."+oo),d.set(g,"."+et,b+"?"+b+".height:"+g+"."+uo),b})}else return null}function ve(i,r,l){var v=i.static,p=i.dynamic;function m(a){if(a in v){var f=v[a];n.commandType(f,"object","invalid "+a,l.commandStr);var o=!0,b=f.x|0,g=f.y|0,w,V;return"width"in f?(w=f.width|0,n.command(w>=0,"invalid "+a,l.commandStr)):o=!1,"height"in f?(V=f.height|0,n.command(V>=0,"invalid "+a,l.commandStr)):o=!1,new He(!o&&r&&r.thisDep,!o&&r&&r.contextDep,!o&&r&&r.propDep,function(U,oe){var ee=U.shared.context,ne=w;"width"in f||(ne=oe.def(ee,".",Jr,"-",b));var ie=V;return"height"in f||(ie=oe.def(ee,".",et,"-",g)),[b,g,ne,ie]})}else if(a in p){var z=p[a],Y=Je(z,function(U,oe){var ee=U.invoke(oe,z);n.optional(function(){U.assert(oe,ee+"&&typeof "+ee+'==="object"',"invalid "+a)});var ne=U.shared.context,ie=oe.def(ee,".x|0"),ue=oe.def(ee,".y|0"),he=oe.def('"width" in ',ee,"?",ee,".width|0:","(",ne,".",Jr,"-",ie,")"),Re=oe.def('"height" in ',ee,"?",ee,".height|0:","(",ne,".",et,"-",ue,")");return n.optional(function(){U.assert(oe,he+">=0&&"+Re+">=0","invalid "+a)}),[ie,ue,he,Re]});return r&&(Y.thisDep=Y.thisDep||r.thisDep,Y.contextDep=Y.contextDep||r.contextDep,Y.propDep=Y.propDep||r.propDep),Y}else return r?new He(r.thisDep,r.contextDep,r.propDep,function(U,oe){var ee=U.shared.context;return[0,0,oe.def(ee,".",Jr),oe.def(ee,".",et)]}):null}var c=m(vr);if(c){var d=c;c=new He(c.thisDep,c.contextDep,c.propDep,function(a,f){var o=d.append(a,f),b=a.shared.context;return f.set(b,"."+qf,o[2]),f.set(b,"."+Yf,o[3]),o})}return{viewport:c,scissor_box:m(Xt)}}function ge(i,r){var l=i.static,v=typeof l[ht]=="string"&&typeof l[vt]=="string";if(v){if(Object.keys(r.dynamic).length>0)return null;var p=r.static,m=Object.keys(p);if(m.length>0&&typeof p[m[0]]=="number"){for(var c=[],d=0;d<m.length;++d)n(typeof p[m[d]]=="number","must specify all vertex attribute locations when using vaos"),c.push([p[m[d]]|0,m[d]]);return c}}return null}function Ee(i,r,l){var v=i.static,p=i.dynamic;function m(o){if(o in v){var b=t.id(v[o]);n.optional(function(){M.shader(po[o],b,n.guessCommand())});var g=Ne(function(){return b});return g.id=b,g}else if(o in p){var w=p[o];return Je(w,function(V,z){var Y=V.invoke(z,w),U=z.def(V.shared.strings,".id(",Y,")");return n.optional(function(){z(V.shared.shader,".shader(",po[o],",",U,",",V.command,");")}),U})}return null}var c=m(ht),d=m(vt),a=null,f;return Sr(c)&&Sr(d)?(a=M.program(d.id,c.id,null,l),f=Ne(function(o,b){return o.link(a)})):f=new He(c&&c.thisDep||d&&d.thisDep,c&&c.contextDep||d&&d.contextDep,c&&c.propDep||d&&d.propDep,function(o,b){var g=o.shared.shader,w;c?w=c.append(o,b):w=b.def(g,".",ht);var V;d?V=d.append(o,b):V=b.def(g,".",vt);var z=g+".program("+V+","+w;return n.optional(function(){z+=","+o.command}),b.def(z+")")}),{frag:c,vert:d,progVar:f,program:a}}function Fe(i,r){var l=i.static,v=i.dynamic,p={},m=!1;function c(){if(pt in l){var oe=l[pt];return oe!==null&&N.getVAO(oe)===null&&(oe=N.createVAO(oe)),m=!0,p.vao=oe,Ne(function(ne){var ie=N.getVAO(oe);return ie?ne.link(ie):"null"})}else if(pt in v){m=!0;var ee=v[pt];return Je(ee,function(ne,ie){var ue=ne.invoke(ie,ee);return ie.def(ne.shared.vao+".getVAO("+ue+")")})}return null}var d=c(),a=!1;function f(){if(Br in l){var oe=l[Br];if(p.elements=oe,aa(oe)){var ee=p.elements=x.create(oe,!0);oe=x.getElements(ee),a=!0}else oe&&(oe=x.getElements(oe),a=!0,n.command(oe,"invalid elements",r.commandStr));var ne=Ne(function(ue,he){if(oe){var Re=ue.link(oe);return ue.ELEMENTS=Re,Re}return ue.ELEMENTS=null,null});return ne.value=oe,ne}else if(Br in v){a=!0;var ie=v[Br];return Je(ie,function(ue,he){var Re=ue.shared,We=Re.isBufferArgs,hr=Re.elements,pr=ue.invoke(he,ie),br=he.def("null"),Ke=he.def(We,"(",pr,")"),mr=ue.cond(Ke).then(br,"=",hr,".createStream(",pr,");").else(br,"=",hr,".getElements(",pr,");");return n.optional(function(){ue.assert(mr.else,"!"+pr+"||"+br,"invalid elements")}),he.entry(mr),he.exit(ue.cond(Ke).then(hr,".destroyStream(",br,");")),ue.ELEMENTS=br,br})}else if(m)return new He(d.thisDep,d.contextDep,d.propDep,function(ue,he){return he.def(ue.shared.vao+".currentVAO?"+ue.shared.elements+".getElements("+ue.shared.vao+".currentVAO.elements):null")});return null}var o=f();function b(){if(Nr in l){var oe=l[Nr];return p.primitive=oe,n.commandParameter(oe,yr,"invalid primitve",r.commandStr),Ne(function(ne,ie){return yr[oe]})}else if(Nr in v){var ee=v[Nr];return Je(ee,function(ne,ie){var ue=ne.constants.primTypes,he=ne.invoke(ie,ee);return n.optional(function(){ne.assert(ie,he+" in "+ue,"invalid primitive, must be one of "+Object.keys(yr))}),ie.def(ue,"[",he,"]")})}else{if(a)return Sr(o)?o.value?Ne(function(ne,ie){return ie.def(ne.ELEMENTS,".primType")}):Ne(function(){return fn}):new He(o.thisDep,o.contextDep,o.propDep,function(ne,ie){var ue=ne.ELEMENTS;return ie.def(ue,"?",ue,".primType:",fn)});if(m)return new He(d.thisDep,d.contextDep,d.propDep,function(ne,ie){return ie.def(ne.shared.vao+".currentVAO?"+ne.shared.vao+".currentVAO.primitive:"+fn)})}return null}function g(oe,ee){if(oe in l){var ne=l[oe]|0;return ee?p.offset=ne:p.instances=ne,n.command(!ee||ne>=0,"invalid "+oe,r.commandStr),Ne(function(ue,he){return ee&&(ue.OFFSET=ne),ne})}else if(oe in v){var ie=v[oe];return Je(ie,function(ue,he){var Re=ue.invoke(he,ie);return ee&&(ue.OFFSET=Re,n.optional(function(){ue.assert(he,Re+">=0","invalid "+oe)})),Re})}else if(ee){if(a)return Ne(function(ue,he){return ue.OFFSET=0,0});if(m)return new He(d.thisDep,d.contextDep,d.propDep,function(ue,he){return he.def(ue.shared.vao+".currentVAO?"+ue.shared.vao+".currentVAO.offset:0")})}else if(m)return new He(d.thisDep,d.contextDep,d.propDep,function(ue,he){return he.def(ue.shared.vao+".currentVAO?"+ue.shared.vao+".currentVAO.instances:-1")});return null}var w=g(Wt,!0);function V(){if(Pr in l){var oe=l[Pr]|0;return p.count=oe,n.command(typeof oe=="number"&&oe>=0,"invalid vertex count",r.commandStr),Ne(function(){return oe})}else if(Pr in v){var ee=v[Pr];return Je(ee,function(he,Re){var We=he.invoke(Re,ee);return n.optional(function(){he.assert(Re,"typeof "+We+'==="number"&&'+We+">=0&&"+We+"===("+We+"|0)","invalid vertex count")}),We})}else if(a)if(Sr(o)){if(o)return w?new He(w.thisDep,w.contextDep,w.propDep,function(he,Re){var We=Re.def(he.ELEMENTS,".vertCount-",he.OFFSET);return n.optional(function(){he.assert(Re,We+">=0","invalid vertex offset/element buffer too small")}),We}):Ne(function(he,Re){return Re.def(he.ELEMENTS,".vertCount")});var ne=Ne(function(){return-1});return n.optional(function(){ne.MISSING=!0}),ne}else{var ie=new He(o.thisDep||w.thisDep,o.contextDep||w.contextDep,o.propDep||w.propDep,function(he,Re){var We=he.ELEMENTS;return he.OFFSET?Re.def(We,"?",We,".vertCount-",he.OFFSET,":-1"):Re.def(We,"?",We,".vertCount:-1")});return n.optional(function(){ie.DYNAMIC=!0}),ie}else if(m){var ue=new He(d.thisDep,d.contextDep,d.propDep,function(he,Re){return Re.def(he.shared.vao,".currentVAO?",he.shared.vao,".currentVAO.count:-1")});return ue}return null}var z=b(),Y=V(),U=g($t,!1);return{elements:o,primitive:z,count:Y,instances:U,offset:w,vao:d,vaoActive:m,elementsActive:a,static:p}}function De(i,r){var l=i.static,v=i.dynamic,p={};return se.forEach(function(m){var c=ae(m);function d(a,f){if(m in l){var o=a(l[m]);p[c]=Ne(function(){return o})}else if(m in v){var b=v[m];p[c]=Je(b,function(g,w){return f(g,w,g.invoke(w,b))})}}switch(m){case Ki:case Xi:case ji:case to:case $i:case no:case Ji:case eo:case ro:case Qi:return d(function(a){return n.commandType(a,"boolean",m,r.commandStr),a},function(a,f,o){return n.optional(function(){a.assert(f,"typeof "+o+'==="boolean"',"invalid flag "+m,a.commandStr)}),o});case qi:return d(function(a){return n.commandParameter(a,tt,"invalid "+m,r.commandStr),tt[a]},function(a,f,o){var b=a.constants.compareFuncs;return n.optional(function(){a.assert(f,o+" in "+b,"invalid "+m+", must be one of "+Object.keys(tt))}),f.def(b,"[",o,"]")});case Yi:return d(function(a){return n.command(Oe(a)&&a.length===2&&typeof a[0]=="number"&&typeof a[1]=="number"&&a[0]<=a[1],"depth range is 2d array",r.commandStr),a},function(a,f,o){n.optional(function(){a.assert(f,a.shared.isArrayLike+"("+o+")&&"+o+".length===2&&typeof "+o+'[0]==="number"&&typeof '+o+'[1]==="number"&&'+o+"[0]<="+o+"[1]","depth range must be a 2d array")});var b=f.def("+",o,"[0]"),g=f.def("+",o,"[1]");return[b,g]});case qa:return d(function(a){n.commandType(a,"object","blend.func",r.commandStr);var f="srcRGB"in a?a.srcRGB:a.src,o="srcAlpha"in a?a.srcAlpha:a.src,b="dstRGB"in a?a.dstRGB:a.dst,g="dstAlpha"in a?a.dstAlpha:a.dst;return n.commandParameter(f,lr,c+".srcRGB",r.commandStr),n.commandParameter(o,lr,c+".srcAlpha",r.commandStr),n.commandParameter(b,lr,c+".dstRGB",r.commandStr),n.commandParameter(g,lr,c+".dstAlpha",r.commandStr),n.command(ho.indexOf(f+", "+b)===-1,"unallowed blending combination (srcRGB, dstRGB) = ("+f+", "+b+")",r.commandStr),[lr[f],lr[b],lr[o],lr[g]]},function(a,f,o){var b=a.constants.blendFuncs;n.optional(function(){a.assert(f,o+"&&typeof "+o+'==="object"',"invalid blend func, must be an object")});function g(ee,ne){var ie=f.def('"',ee,ne,'" in ',o,"?",o,".",ee,ne,":",o,".",ee);return n.optional(function(){a.assert(f,ie+" in "+b,"invalid "+m+"."+ee+ne+", must be one of "+Object.keys(lr))}),ie}var w=g("src","RGB"),V=g("dst","RGB");n.optional(function(){var ee=a.constants.invalidBlendCombinations;a.assert(f,ee+".indexOf("+w+'+", "+'+V+") === -1 ","unallowed blending combination for (srcRGB, dstRGB)")});var z=f.def(b,"[",w,"]"),Y=f.def(b,"[",g("src","Alpha"),"]"),U=f.def(b,"[",V,"]"),oe=f.def(b,"[",g("dst","Alpha"),"]");return[z,U,Y,oe]});case $a:return d(function(a){if(typeof a=="string")return n.commandParameter(a,T,"invalid "+m,r.commandStr),[T[a],T[a]];if(typeof a=="object")return n.commandParameter(a.rgb,T,m+".rgb",r.commandStr),n.commandParameter(a.alpha,T,m+".alpha",r.commandStr),[T[a.rgb],T[a.alpha]];n.commandRaise("invalid blend.equation",r.commandStr)},function(a,f,o){var b=a.constants.blendEquations,g=f.def(),w=f.def(),V=a.cond("typeof ",o,'==="string"');return n.optional(function(){function z(Y,U,oe){a.assert(Y,oe+" in "+b,"invalid "+U+", must be one of "+Object.keys(T))}z(V.then,m,o),a.assert(V.else,o+"&&typeof "+o+'==="object"',"invalid "+m),z(V.else,m+".rgb",o+".rgb"),z(V.else,m+".alpha",o+".alpha")}),V.then(g,"=",w,"=",b,"[",o,"];"),V.else(g,"=",b,"[",o,".rgb];",w,"=",b,"[",o,".alpha];"),f(V),[g,w]});case Wi:return d(function(a){return n.command(Oe(a)&&a.length===4,"blend.color must be a 4d array",r.commandStr),tr(4,function(f){return+a[f]})},function(a,f,o){return n.optional(function(){a.assert(f,a.shared.isArrayLike+"("+o+")&&"+o+".length===4","blend.color must be a 4d array")}),tr(4,function(b){return f.def("+",o,"[",b,"]")})});case ao:return d(function(a){return n.commandType(a,"number",c,r.commandStr),a|0},function(a,f,o){return n.optional(function(){a.assert(f,"typeof "+o+'==="number"',"invalid stencil.mask")}),f.def(o,"|0")});case en:return d(function(a){n.commandType(a,"object",c,r.commandStr);var f=a.cmp||"keep",o=a.ref||0,b="mask"in a?a.mask:-1;return n.commandParameter(f,tt,m+".cmp",r.commandStr),n.commandType(o,"number",m+".ref",r.commandStr),n.commandType(b,"number",m+".mask",r.commandStr),[tt[f],o,b]},function(a,f,o){var b=a.constants.compareFuncs;n.optional(function(){function z(){a.assert(f,Array.prototype.join.call(arguments,""),"invalid stencil.func")}z(o+"&&typeof ",o,'==="object"'),z('!("cmp" in ',o,")||(",o,".cmp in ",b,")")});var g=f.def('"cmp" in ',o,"?",b,"[",o,".cmp]",":",Tr),w=f.def(o,".ref|0"),V=f.def('"mask" in ',o,"?",o,".mask|0:-1");return[g,w,V]});case rn:case mt:return d(function(a){n.commandType(a,"object",c,r.commandStr);var f=a.fail||"keep",o=a.zfail||"keep",b=a.zpass||"keep";return n.commandParameter(f,Ar,m+".fail",r.commandStr),n.commandParameter(o,Ar,m+".zfail",r.commandStr),n.commandParameter(b,Ar,m+".zpass",r.commandStr),[m===mt?Mr:Et,Ar[f],Ar[o],Ar[b]]},function(a,f,o){var b=a.constants.stencilOps;n.optional(function(){a.assert(f,o+"&&typeof "+o+'==="object"',"invalid "+m)});function g(w){return n.optional(function(){a.assert(f,'!("'+w+'" in '+o+")||("+o+"."+w+" in "+b+")","invalid "+m+"."+w+", must be one of "+Object.keys(Ar))}),f.def('"',w,'" in ',o,"?",b,"[",o,".",w,"]:",Tr)}return[m===mt?Mr:Et,g("fail"),g("zfail"),g("zpass")]});case Za:return d(function(a){n.commandType(a,"object",c,r.commandStr);var f=a.factor|0,o=a.units|0;return n.commandType(f,"number",c+".factor",r.commandStr),n.commandType(o,"number",c+".units",r.commandStr),[f,o]},function(a,f,o){n.optional(function(){a.assert(f,o+"&&typeof "+o+'==="object"',"invalid "+m)});var b=f.def(o,".factor|0"),g=f.def(o,".units|0");return[b,g]});case Zi:return d(function(a){var f=0;return a==="front"?f=Et:a==="back"&&(f=Mr),n.command(!!f,c,r.commandStr),f},function(a,f,o){return n.optional(function(){a.assert(f,o+'==="front"||'+o+'==="back"',"invalid cull.face")}),f.def(o,'==="front"?',Et,":",Mr)});case Ka:return d(function(a){return n.command(typeof a=="number"&&a>=y.lineWidthDims[0]&&a<=y.lineWidthDims[1],"invalid line width, must be a positive number between "+y.lineWidthDims[0]+" and "+y.lineWidthDims[1],r.commandStr),a},function(a,f,o){return n.optional(function(){a.assert(f,"typeof "+o+'==="number"&&'+o+">="+y.lineWidthDims[0]+"&&"+o+"<="+y.lineWidthDims[1],"invalid line width")}),o});case Qa:return d(function(a){return n.commandParameter(a,cn,c,r.commandStr),cn[a]},function(a,f,o){return n.optional(function(){a.assert(f,o+'==="cw"||'+o+'==="ccw"',"invalid frontFace, must be one of cw,ccw")}),f.def(o+'==="cw"?'+fo+":"+ln)});case Ya:return d(function(a){return n.command(Oe(a)&&a.length===4,"color.mask must be length 4 array",r.commandStr),a.map(function(f){return!!f})},function(a,f,o){return n.optional(function(){a.assert(f,a.shared.isArrayLike+"("+o+")&&"+o+".length===4","invalid color.mask")}),tr(4,function(b){return"!!"+o+"["+b+"]"})});case Ja:return d(function(a){n.command(typeof a=="object"&&a,c,r.commandStr);var f="value"in a?a.value:1,o=!!a.invert;return n.command(typeof f=="number"&&f>=0&&f<=1,"sample.coverage.value must be a number between 0 and 1",r.commandStr),[f,o]},function(a,f,o){n.optional(function(){a.assert(f,o+"&&typeof "+o+'==="object"',"invalid sample.coverage")});var b=f.def('"value" in ',o,"?+",o,".value:1"),g=f.def("!!",o,".invert");return[b,g]})}}),p}function Ae(i,r){var l=i.static,v=i.dynamic,p={};return Object.keys(l).forEach(function(m){var c=l[m],d;if(typeof c=="number"||typeof c=="boolean")d=Ne(function(){return c});else if(typeof c=="function"){var a=c._reglType;a==="texture2d"||a==="textureCube"?d=Ne(function(f){return f.link(c)}):a==="framebuffer"||a==="framebufferCube"?(n.command(c.color.length>0,'missing color attachment for framebuffer sent to uniform "'+m+'"',r.commandStr),d=Ne(function(f){return f.link(c.color[0])})):n.commandRaise('invalid data for uniform "'+m+'"',r.commandStr)}else Oe(c)?d=Ne(function(f){var o=f.global.def("[",tr(c.length,function(b){return n.command(typeof c[b]=="number"||typeof c[b]=="boolean","invalid uniform "+m,f.commandStr),c[b]}),"]");return o}):n.commandRaise('invalid or missing data for uniform "'+m+'"',r.commandStr);d.value=c,p[m]=d}),Object.keys(v).forEach(function(m){var c=v[m];p[m]=Je(c,function(d,a){return d.invoke(a,c)})}),p}function Ue(i,r){var l=i.static,v=i.dynamic,p={};return Object.keys(l).forEach(function(m){var c=l[m],d=t.id(m),a=new h;if(aa(c))a.state=Zr,a.buffer=L.getBuffer(L.create(c,rt,!1,!0)),a.type=0;else{var f=L.getBuffer(c);if(f)a.state=Zr,a.buffer=f,a.type=0;else if(n.command(typeof c=="object"&&c,"invalid data for attribute "+m,r.commandStr),"constant"in c){var o=c.constant;a.buffer="null",a.state=za,typeof o=="number"?a.x=o:(n.command(Oe(o)&&o.length>0&&o.length<=4,"invalid constant for attribute "+m,r.commandStr),Kr.forEach(function(U,oe){oe<o.length&&(a[U]=o[oe])}))}else{aa(c.buffer)?f=L.getBuffer(L.create(c.buffer,rt,!1,!0)):f=L.getBuffer(c.buffer),n.command(!!f,'missing buffer for attribute "'+m+'"',r.commandStr);var b=c.offset|0;n.command(b>=0,'invalid offset for attribute "'+m+'"',r.commandStr);var g=c.stride|0;n.command(g>=0&&g<256,'invalid stride for attribute "'+m+'", must be integer betweeen [0, 255]',r.commandStr);var w=c.size|0;n.command(!("size"in c)||w>0&&w<=4,'invalid size for attribute "'+m+'", must be 1,2,3,4',r.commandStr);var V=!!c.normalized,z=0;"type"in c&&(n.commandParameter(c.type,Gr,"invalid type for attribute "+m,r.commandStr),z=Gr[c.type]);var Y=c.divisor|0;n.optional(function(){"divisor"in c&&(n.command(Y===0||k,'cannot specify divisor for attribute "'+m+'", instancing not supported',r.commandStr),n.command(Y>=0,'invalid divisor for attribute "'+m+'"',r.commandStr));var U=r.commandStr,oe=["buffer","offset","divisor","normalized","type","size","stride"];Object.keys(c).forEach(function(ee){n.command(oe.indexOf(ee)>=0,'unknown parameter "'+ee+'" for attribute pointer "'+m+'" (valid parameters are '+oe+")",U)})}),a.buffer=f,a.state=Zr,a.size=w,a.normalized=V,a.type=z||f.dtype,a.offset=b,a.stride=g,a.divisor=Y}}p[m]=Ne(function(U,oe){var ee=U.attribCache;if(d in ee)return ee[d];var ne={isStream:!1};return Object.keys(a).forEach(function(ie){ne[ie]=a[ie]}),a.buffer&&(ne.buffer=U.link(a.buffer),ne.type=ne.type||ne.buffer+".dtype"),ee[d]=ne,ne})}),Object.keys(v).forEach(function(m){var c=v[m];function d(a,f){var o=a.invoke(f,c),b=a.shared,g=a.constants,w=b.isBufferArgs,V=b.buffer;n.optional(function(){a.assert(f,o+"&&(typeof "+o+'==="object"||typeof '+o+'==="function")&&('+w+"("+o+")||"+V+".getBuffer("+o+")||"+V+".getBuffer("+o+".buffer)||"+w+"("+o+'.buffer)||("constant" in '+o+"&&(typeof "+o+'.constant==="number"||'+b.isArrayLike+"("+o+".constant))))",'invalid dynamic attribute "'+m+'"')});var z={isStream:f.def(!1)},Y=new h;Y.state=Zr,Object.keys(Y).forEach(function(ne){z[ne]=f.def(""+Y[ne])});var U=z.buffer,oe=z.type;f("if(",w,"(",o,")){",z.isStream,"=true;",U,"=",V,".createStream(",rt,",",o,");",oe,"=",U,".dtype;","}else{",U,"=",V,".getBuffer(",o,");","if(",U,"){",oe,"=",U,".dtype;",'}else if("constant" in ',o,"){",z.state,"=",za,";","if(typeof "+o+'.constant === "number"){',z[Kr[0]],"=",o,".constant;",Kr.slice(1).map(function(ne){return z[ne]}).join("="),"=0;","}else{",Kr.map(function(ne,ie){return z[ne]+"="+o+".constant.length>"+ie+"?"+o+".constant["+ie+"]:0;"}).join(""),"}}else{","if(",w,"(",o,".buffer)){",U,"=",V,".createStream(",rt,",",o,".buffer);","}else{",U,"=",V,".getBuffer(",o,".buffer);","}",oe,'="type" in ',o,"?",g.glTypes,"[",o,".type]:",U,".dtype;",z.normalized,"=!!",o,".normalized;");function ee(ne){f(z[ne],"=",o,".",ne,"|0;")}return ee("size"),ee("offset"),ee("stride"),ee("divisor"),f("}}"),f.exit("if(",z.isStream,"){",V,".destroyStream(",U,");","}"),z}p[m]=Je(c,d)}),p}function Ge(i){var r=i.static,l=i.dynamic,v={};return Object.keys(r).forEach(function(p){var m=r[p];v[p]=Ne(function(c,d){return typeof m=="number"||typeof m=="boolean"?""+m:c.link(m)})}),Object.keys(l).forEach(function(p){var m=l[p];v[p]=Je(m,function(c,d){return c.invoke(d,m)})}),v}function Pe(i,r,l,v,p){var m=i.static,c=i.dynamic;n.optional(function(){var ee=[kr,vt,ht,Br,Nr,Wt,Pr,$t,dt,pt].concat(se);function ne(ie){Object.keys(ie).forEach(function(ue){n.command(ee.indexOf(ue)>=0,'unknown parameter "'+ue+'"',p.commandStr)})}ne(m),ne(c)});var d=ge(i,r),a=K(i,p),f=ve(i,a,p),o=Fe(i,p),b=De(i,p),g=Ee(i,p,d);function w(ee){var ne=f[ee];ne&&(b[ee]=ne)}w(vr),w(ae(Xt));var V=Object.keys(b).length>0,z={framebuffer:a,draw:o,shader:g,state:b,dirty:V,scopeVAO:null,drawVAO:null,useVAO:!1,attributes:{}};if(z.profile=q(i,p),z.uniforms=Ae(l,p),z.drawVAO=z.scopeVAO=o.vao,!z.drawVAO&&g.program&&!d&&s.angle_instanced_arrays&&o.static.elements){var Y=!0,U=g.program.attributes.map(function(ee){var ne=r.static[ee];return Y=Y&&!!ne,ne});if(Y&&U.length>0){var oe=N.getVAO(N.createVAO({attributes:U,elements:o.static.elements}));z.drawVAO=new He(null,null,null,function(ee,ne){return ee.link(oe)}),z.useVAO=!0}}return d?z.useVAO=!0:z.attributes=Ue(r,p),z.context=Ge(v,p),z}function Ve(i,r,l){var v=i.shared,p=v.context,m=i.scope();Object.keys(l).forEach(function(c){r.save(p,"."+c);var d=l[c],a=d.append(i,r);Array.isArray(a)?m(p,".",c,"=[",a.join(),"];"):m(p,".",c,"=",a,";")}),r(m)}function ze(i,r,l,v){var p=i.shared,m=p.gl,c=p.framebuffer,d;Z&&(d=r.def(p.extensions,".webgl_draw_buffers"));var a=i.constants,f=a.drawBuffer,o=a.backBuffer,b;l?b=l.append(i,r):b=r.def(c,".next"),v||r("if(",b,"!==",c,".cur){"),r("if(",b,"){",m,".bindFramebuffer(",vo,",",b,".framebuffer);"),Z&&r(d,".drawBuffersWEBGL(",f,"[",b,".colorAttachments.length]);"),r("}else{",m,".bindFramebuffer(",vo,",null);"),Z&&r(d,".drawBuffersWEBGL(",o,");"),r("}",c,".cur=",b,";"),v||r("}")}function Xe(i,r,l){var v=i.shared,p=v.gl,m=i.current,c=i.next,d=v.current,a=v.next,f=i.cond(d,".dirty");se.forEach(function(o){var b=ae(o);if(!(b in l.state)){var g,w;if(b in c){g=c[b],w=m[b];var V=tr(Q[b].length,function(Y){return f.def(g,"[",Y,"]")});f(i.cond(V.map(function(Y,U){return Y+"!=="+w+"["+U+"]"}).join("||")).then(p,".",S[b],"(",V,");",V.map(function(Y,U){return w+"["+U+"]="+Y}).join(";"),";"))}else{g=f.def(a,".",b);var z=i.cond(g,"!==",d,".",b);f(z),b in C?z(i.cond(g).then(p,".enable(",C[b],");").else(p,".disable(",C[b],");"),d,".",b,"=",g,";"):z(p,".",S[b],"(",g,");",d,".",b,"=",g,";")}}}),Object.keys(l.state).length===0&&f(d,".dirty=false;"),r(f)}function Ye(i,r,l,v){var p=i.shared,m=i.current,c=p.current,d=p.gl;bo(Object.keys(l)).forEach(function(a){var f=l[a];if(!(v&&!v(f))){var o=f.append(i,r);if(C[a]){var b=C[a];Sr(f)?o?r(d,".enable(",b,");"):r(d,".disable(",b,");"):r(i.cond(o).then(d,".enable(",b,");").else(d,".disable(",b,");")),r(c,".",a,"=",o,";")}else if(Oe(o)){var g=m[a];r(d,".",S[a],"(",o,");",o.map(function(w,V){return g+"["+V+"]="+w}).join(";"),";")}else r(d,".",S[a],"(",o,");",c,".",a,"=",o,";")}})}function Ie(i,r){k&&(i.instancing=r.def(i.shared.extensions,".angle_instanced_arrays"))}function xe(i,r,l,v,p){var m=i.shared,c=i.stats,d=m.current,a=m.timer,f=l.profile;function o(){return typeof performance>"u"?"Date.now()":"performance.now()"}var b,g;function w(ee){b=r.def(),ee(b,"=",o(),";"),typeof p=="string"?ee(c,".count+=",p,";"):ee(c,".count++;"),O&&(v?(g=r.def(),ee(g,"=",a,".getNumPendingQueries();")):ee(a,".beginQuery(",c,");"))}function V(ee){ee(c,".cpuTime+=",o(),"-",b,";"),O&&(v?ee(a,".pushScopeStats(",g,",",a,".getNumPendingQueries(),",c,");"):ee(a,".endQuery();"))}function z(ee){var ne=r.def(d,".profile");r(d,".profile=",ee,";"),r.exit(d,".profile=",ne,";")}var Y;if(f){if(Sr(f)){f.enable?(w(r),V(r.exit),z("true")):z("false");return}Y=f.append(i,r),z(Y)}else Y=r.def(d,".profile");var U=i.block();w(U),r("if(",Y,"){",U,"}");var oe=i.block();V(oe),r.exit("if(",Y,"){",oe,"}")}function Qe(i,r,l,v,p){var m=i.shared;function c(a){switch(a){case qt:case Kt:case ea:return 2;case Yt:case Zt:case ra:return 3;case Qt:case Jt:case ta:return 4;default:return 1}}function d(a,f,o){var b=m.gl,g=r.def(a,".location"),w=r.def(m.attributes,"[",g,"]"),V=o.state,z=o.buffer,Y=[o.x,o.y,o.z,o.w],U=["buffer","normalized","offset","stride"];function oe(){r("if(!",w,".buffer){",b,".enableVertexAttribArray(",g,");}");var ne=o.type,ie;if(o.size?ie=r.def(o.size,"||",f):ie=f,r("if(",w,".type!==",ne,"||",w,".size!==",ie,"||",U.map(function(he){return w+"."+he+"!=="+o[he]}).join("||"),"){",b,".bindBuffer(",rt,",",z,".buffer);",b,".vertexAttribPointer(",[g,ie,ne,o.normalized,o.stride,o.offset],");",w,".type=",ne,";",w,".size=",ie,";",U.map(function(he){return w+"."+he+"="+o[he]+";"}).join(""),"}"),k){var ue=o.divisor;r("if(",w,".divisor!==",ue,"){",i.instancing,".vertexAttribDivisorANGLE(",[g,ue],");",w,".divisor=",ue,";}")}}function ee(){r("if(",w,".buffer){",b,".disableVertexAttribArray(",g,");",w,".buffer=null;","}if(",Kr.map(function(ne,ie){return w+"."+ne+"!=="+Y[ie]}).join("||"),"){",b,".vertexAttrib4f(",g,",",Y,");",Kr.map(function(ne,ie){return w+"."+ne+"="+Y[ie]+";"}).join(""),"}")}V===Zr?oe():V===za?ee():(r("if(",V,"===",Zr,"){"),oe(),r("}else{"),ee(),r("}"))}v.forEach(function(a){var f=a.name,o=l.attributes[f],b;if(o){if(!p(o))return;b=o.append(i,r)}else{if(!p(go))return;var g=i.scopeAttrib(f);n.optional(function(){i.assert(r,g+".state","missing attribute "+f)}),b={},Object.keys(new h).forEach(function(w){b[w]=r.def(g,".",w)})}d(i.link(a),c(a.info.type),b)})}function we(i,r,l,v,p,m){for(var c=i.shared,d=c.gl,a,f=0;f<v.length;++f){var o=v[f],b=o.name,g=o.info.type,w=l.uniforms[b],V=i.link(o),z=V+".location",Y;if(w){if(!p(w))continue;if(Sr(w)){var U=w.value;if(n.command(U!==null&&typeof U<"u",'missing uniform "'+b+'"',i.commandStr),g===xt||g===yt){n.command(typeof U=="function"&&(g===xt&&(U._reglType==="texture2d"||U._reglType==="framebuffer")||g===yt&&(U._reglType==="textureCube"||U._reglType==="framebufferCube")),"invalid texture for uniform "+b,i.commandStr);var oe=i.link(U._texture||U.color[0]._texture);r(d,".uniform1i(",z,",",oe+".bind());"),r.exit(oe,".unbind();")}else if(g===bt||g===gt||g===_t){n.optional(function(){n.command(Oe(U),"invalid matrix for uniform "+b,i.commandStr),n.command(g===bt&&U.length===4||g===gt&&U.length===9||g===_t&&U.length===16,"invalid length for matrix uniform "+b,i.commandStr)});var ee=i.global.def("new Float32Array(["+Array.prototype.slice.call(U)+"])"),ne=2;g===gt?ne=3:g===_t&&(ne=4),r(d,".uniformMatrix",ne,"fv(",z,",false,",ee,");")}else{switch(g){case on:n.commandType(U,"number","uniform "+b,i.commandStr),a="1f";break;case qt:n.command(Oe(U)&&U.length===2,"uniform "+b,i.commandStr),a="2f";break;case Yt:n.command(Oe(U)&&U.length===3,"uniform "+b,i.commandStr),a="3f";break;case Qt:n.command(Oe(U)&&U.length===4,"uniform "+b,i.commandStr),a="4f";break;case sn:n.commandType(U,"boolean","uniform "+b,i.commandStr),a="1i";break;case un:n.commandType(U,"number","uniform "+b,i.commandStr),a="1i";break;case ea:n.command(Oe(U)&&U.length===2,"uniform "+b,i.commandStr),a="2i";break;case Kt:n.command(Oe(U)&&U.length===2,"uniform "+b,i.commandStr),a="2i";break;case ra:n.command(Oe(U)&&U.length===3,"uniform "+b,i.commandStr),a="3i";break;case Zt:n.command(Oe(U)&&U.length===3,"uniform "+b,i.commandStr),a="3i";break;case ta:n.command(Oe(U)&&U.length===4,"uniform "+b,i.commandStr),a="4i";break;case Jt:n.command(Oe(U)&&U.length===4,"uniform "+b,i.commandStr),a="4i";break}r(d,".uniform",a,"(",z,",",Oe(U)?Array.prototype.slice.call(U):U,");")}continue}else Y=w.append(i,r)}else{if(!p(go))continue;Y=r.def(c.uniforms,"[",t.id(b),"]")}g===xt?(n(!Array.isArray(Y),"must specify a scalar prop for textures"),r("if(",Y,"&&",Y,'._reglType==="framebuffer"){',Y,"=",Y,".color[0];","}")):g===yt&&(n(!Array.isArray(Y),"must specify a scalar prop for cube maps"),r("if(",Y,"&&",Y,'._reglType==="framebufferCube"){',Y,"=",Y,".color[0];","}")),n.optional(function(){function Ke(sr,So){i.assert(r,sr,'bad data or missing for uniform "'+b+'".  '+So)}function mr(sr){n(!Array.isArray(Y),"must not specify an array type for uniform"),Ke("typeof "+Y+'==="'+sr+'"',"invalid type, expected "+sr)}function ir(sr,So){Array.isArray(Y)?n(Y.length===sr,"must have length "+sr):Ke(c.isArrayLike+"("+Y+")&&"+Y+".length==="+sr,"invalid vector, should have length "+sr,i.commandStr)}function Ao(sr){n(!Array.isArray(Y),"must not specify a value type"),Ke("typeof "+Y+'==="function"&&'+Y+'._reglType==="texture'+(sr===so?"2d":"Cube")+'"',"invalid texture type",i.commandStr)}switch(g){case un:mr("number");break;case Kt:ir(2,"number");break;case Zt:ir(3,"number");break;case Jt:ir(4,"number");break;case on:mr("number");break;case qt:ir(2,"number");break;case Yt:ir(3,"number");break;case Qt:ir(4,"number");break;case sn:mr("boolean");break;case ea:ir(2,"boolean");break;case ra:ir(3,"boolean");break;case ta:ir(4,"boolean");break;case bt:ir(4,"number");break;case gt:ir(9,"number");break;case _t:ir(16,"number");break;case xt:Ao(so);break;case yt:Ao(Jf);break}});var ie=1;switch(g){case xt:case yt:var ue=r.def(Y,"._texture");r(d,".uniform1i(",z,",",ue,".bind());"),r.exit(ue,".unbind();");continue;case un:case sn:a="1i";break;case Kt:case ea:a="2i",ie=2;break;case Zt:case ra:a="3i",ie=3;break;case Jt:case ta:a="4i",ie=4;break;case on:a="1f";break;case qt:a="2f",ie=2;break;case Yt:a="3f",ie=3;break;case Qt:a="4f",ie=4;break;case bt:a="Matrix2fv";break;case gt:a="Matrix3fv";break;case _t:a="Matrix4fv";break}if(a.charAt(0)==="M"){r(d,".uniform",a,"(",z,",");var he=Math.pow(g-bt+2,2),Re=i.global.def("new Float32Array(",he,")");Array.isArray(Y)?r("false,(",tr(he,function(Ke){return Re+"["+Ke+"]="+Y[Ke]}),",",Re,")"):r("false,(Array.isArray(",Y,")||",Y," instanceof Float32Array)?",Y,":(",tr(he,function(Ke){return Re+"["+Ke+"]="+Y+"["+Ke+"]"}),",",Re,")"),r(");")}else if(ie>1){for(var We=[],hr=[],pr=0;pr<ie;++pr)Array.isArray(Y)?hr.push(Y[pr]):hr.push(r.def(Y+"["+pr+"]")),m&&We.push(r.def());m&&r("if(!",i.batchId,"||",We.map(function(Ke,mr){return Ke+"!=="+hr[mr]}).join("||"),"){",We.map(function(Ke,mr){return Ke+"="+hr[mr]+";"}).join("")),r(d,".uniform",a,"(",z,",",hr.join(","),");"),m&&r("}")}else{if(n(!Array.isArray(Y),"uniform value must not be an array"),m){var br=r.def();r("if(!",i.batchId,"||",br,"!==",Y,"){",br,"=",Y,";")}r(d,".uniform",a,"(",z,",",Y,");"),m&&r("}")}}}function me(i,r,l,v){var p=i.shared,m=p.gl,c=p.draw,d=v.draw;function a(){var ie=d.elements,ue,he=r;return ie?((ie.contextDep&&v.contextDynamic||ie.propDep)&&(he=l),ue=ie.append(i,he),d.elementsActive&&he("if("+ue+")"+m+".bindBuffer("+nn+","+ue+".buffer.buffer);")):(ue=he.def(),he(ue,"=",c,".",Br,";","if(",ue,"){",m,".bindBuffer(",nn,",",ue,".buffer.buffer);}","else if(",p.vao,".currentVAO){",ue,"=",i.shared.elements+".getElements("+p.vao,".currentVAO.elements);",R?"":"if("+ue+")"+m+".bindBuffer("+nn+","+ue+".buffer.buffer);","}")),ue}function f(){var ie=d.count,ue,he=r;return ie?((ie.contextDep&&v.contextDynamic||ie.propDep)&&(he=l),ue=ie.append(i,he),n.optional(function(){ie.MISSING&&i.assert(r,"false","missing vertex count"),ie.DYNAMIC&&i.assert(he,ue+">=0","missing vertex count")})):(ue=he.def(c,".",Pr),n.optional(function(){i.assert(he,ue+">=0","missing vertex count")})),ue}var o=a();function b(ie){var ue=d[ie];return ue?ue.contextDep&&v.contextDynamic||ue.propDep?ue.append(i,l):ue.append(i,r):r.def(c,".",ie)}var g=b(Nr),w=b(Wt),V=f();if(typeof V=="number"){if(V===0)return}else l("if(",V,"){"),l.exit("}");var z,Y;k&&(z=b($t),Y=i.instancing);var U=o+".type",oe=d.elements&&Sr(d.elements)&&!d.vaoActive;function ee(){function ie(){l(Y,".drawElementsInstancedANGLE(",[g,V,U,w+"<<(("+U+"-"+Vi+")>>1)",z],");")}function ue(){l(Y,".drawArraysInstancedANGLE(",[g,w,V,z],");")}o&&o!=="null"?oe?ie():(l("if(",o,"){"),ie(),l("}else{"),ue(),l("}")):ue()}function ne(){function ie(){l(m+".drawElements("+[g,V,U,w+"<<(("+U+"-"+Vi+")>>1)"]+");")}function ue(){l(m+".drawArrays("+[g,w,V]+");")}o&&o!=="null"?oe?ie():(l("if(",o,"){"),ie(),l("}else{"),ue(),l("}")):ue()}k&&(typeof z!="number"||z>=0)?typeof z=="string"?(l("if(",z,">0){"),ee(),l("}else if(",z,"<0){"),ne(),l("}")):ee():ne()}function Te(i,r,l,v,p){var m=be(),c=m.proc("body",p);return n.optional(function(){m.commandStr=r.commandStr,m.command=m.link(r.commandStr)}),k&&(m.instancing=c.def(m.shared.extensions,".angle_instanced_arrays")),i(m,c,l,v),m.compile().body}function Le(i,r,l,v){Ie(i,r),l.useVAO?l.drawVAO?r(i.shared.vao,".setVAO(",l.drawVAO.append(i,r),");"):r(i.shared.vao,".setVAO(",i.shared.vao,".targetVAO);"):(r(i.shared.vao,".setVAO(null);"),Qe(i,r,l,v.attributes,function(){return!0})),we(i,r,l,v.uniforms,function(){return!0},!1),me(i,r,r,l)}function ke(i,r){var l=i.proc("draw",1);Ie(i,l),Ve(i,l,r.context),ze(i,l,r.framebuffer),Xe(i,l,r),Ye(i,l,r.state),xe(i,l,r,!1,!0);var v=r.shader.progVar.append(i,l);if(l(i.shared.gl,".useProgram(",v,".program);"),r.shader.program)Le(i,l,r,r.shader.program);else{l(i.shared.vao,".setVAO(null);");var p=i.global.def("{}"),m=l.def(v,".id"),c=l.def(p,"[",m,"]");l(i.cond(c).then(c,".call(this,a0);").else(c,"=",p,"[",m,"]=",i.link(function(d){return Te(Le,i,r,d,1)}),"(",v,");",c,".call(this,a0);"))}Object.keys(r.state).length>0&&l(i.shared.current,".dirty=true;"),i.shared.vao&&l(i.shared.vao,".setVAO(null);")}function cr(i,r,l,v){i.batchId="a1",Ie(i,r);function p(){return!0}Qe(i,r,l,v.attributes,p),we(i,r,l,v.uniforms,p,!1),me(i,r,r,l)}function Ur(i,r,l,v){Ie(i,r);var p=l.contextDep,m=r.def(),c="a0",d="a1",a=r.def();i.shared.props=a,i.batchId=m;var f=i.scope(),o=i.scope();r(f.entry,"for(",m,"=0;",m,"<",d,";++",m,"){",a,"=",c,"[",m,"];",o,"}",f.exit);function b(U){return U.contextDep&&p||U.propDep}function g(U){return!b(U)}if(l.needsContext&&Ve(i,o,l.context),l.needsFramebuffer&&ze(i,o,l.framebuffer),Ye(i,o,l.state,b),l.profile&&b(l.profile)&&xe(i,o,l,!1,!0),v)l.useVAO?l.drawVAO?b(l.drawVAO)?o(i.shared.vao,".setVAO(",l.drawVAO.append(i,o),");"):f(i.shared.vao,".setVAO(",l.drawVAO.append(i,f),");"):f(i.shared.vao,".setVAO(",i.shared.vao,".targetVAO);"):(f(i.shared.vao,".setVAO(null);"),Qe(i,f,l,v.attributes,g),Qe(i,o,l,v.attributes,b)),we(i,f,l,v.uniforms,g,!1),we(i,o,l,v.uniforms,b,!0),me(i,f,o,l);else{var w=i.global.def("{}"),V=l.shader.progVar.append(i,o),z=o.def(V,".id"),Y=o.def(w,"[",z,"]");o(i.shared.gl,".useProgram(",V,".program);","if(!",Y,"){",Y,"=",w,"[",z,"]=",i.link(function(U){return Te(cr,i,l,U,2)}),"(",V,");}",Y,".call(this,a0[",m,"],",m,");")}}function u(i,r){var l=i.proc("batch",2);i.batchId="0",Ie(i,l);var v=!1,p=!0;Object.keys(r.context).forEach(function(w){v=v||r.context[w].propDep}),v||(Ve(i,l,r.context),p=!1);var m=r.framebuffer,c=!1;m?(m.propDep?v=c=!0:m.contextDep&&v&&(c=!0),c||ze(i,l,m)):ze(i,l,null),r.state.viewport&&r.state.viewport.propDep&&(v=!0);function d(w){return w.contextDep&&v||w.propDep}Xe(i,l,r),Ye(i,l,r.state,function(w){return!d(w)}),(!r.profile||!d(r.profile))&&xe(i,l,r,!1,"a1"),r.contextDep=v,r.needsContext=p,r.needsFramebuffer=c;var a=r.shader.progVar;if(a.contextDep&&v||a.propDep)Ur(i,l,r,null);else{var f=a.append(i,l);if(l(i.shared.gl,".useProgram(",f,".program);"),r.shader.program)Ur(i,l,r,r.shader.program);else{l(i.shared.vao,".setVAO(null);");var o=i.global.def("{}"),b=l.def(f,".id"),g=l.def(o,"[",b,"]");l(i.cond(g).then(g,".call(this,a0,a1);").else(g,"=",o,"[",b,"]=",i.link(function(w){return Te(Ur,i,r,w,2)}),"(",f,");",g,".call(this,a0,a1);"))}}Object.keys(r.state).length>0&&l(i.shared.current,".dirty=true;"),i.shared.vao&&l(i.shared.vao,".setVAO(null);")}function E(i,r){var l=i.proc("scope",3);i.batchId="a2";var v=i.shared,p=v.current;Ve(i,l,r.context),r.framebuffer&&r.framebuffer.append(i,l),bo(Object.keys(r.state)).forEach(function(c){var d=r.state[c],a=d.append(i,l);Oe(a)?a.forEach(function(f,o){l.set(i.next[c],"["+o+"]",f)}):l.set(v.next,"."+c,a)}),xe(i,l,r,!0,!0),[Br,Wt,Pr,$t,Nr].forEach(function(c){var d=r.draw[c];d&&l.set(v.draw,"."+c,""+d.append(i,l))}),Object.keys(r.uniforms).forEach(function(c){var d=r.uniforms[c].append(i,l);Array.isArray(d)&&(d="["+d.join()+"]"),l.set(v.uniforms,"["+t.id(c)+"]",d)}),Object.keys(r.attributes).forEach(function(c){var d=r.attributes[c].append(i,l),a=i.scopeAttrib(c);Object.keys(new h).forEach(function(f){l.set(a,"."+f,d[f])})}),r.scopeVAO&&l.set(v.vao,".targetVAO",r.scopeVAO.append(i,l));function m(c){var d=r.shader[c];d&&l.set(v.shader,"."+c,d.append(i,l))}m(vt),m(ht),Object.keys(r.state).length>0&&(l(p,".dirty=true;"),l.exit(p,".dirty=true;")),l("a1(",i.shared.context,",a0,",i.batchId,");")}function _(i){if(!(typeof i!="object"||Oe(i))){for(var r=Object.keys(i),l=0;l<r.length;++l)if(rr.isDynamic(i[r[l]]))return!0;return!1}}function te(i,r,l){var v=r.static[l];if(!v||!_(v))return;var p=i.global,m=Object.keys(v),c=!1,d=!1,a=!1,f=i.global.def("{}");m.forEach(function(b){var g=v[b];if(rr.isDynamic(g)){typeof g=="function"&&(g=v[b]=rr.unbox(g));var w=Je(g,null);c=c||w.thisDep,a=a||w.propDep,d=d||w.contextDep}else{switch(p(f,".",b,"="),typeof g){case"number":p(g);break;case"string":p('"',g,'"');break;case"object":Array.isArray(g)&&p("[",g.join(),"]");break;default:p(i.link(g));break}p(";")}});function o(b,g){m.forEach(function(w){var V=v[w];if(rr.isDynamic(V)){var z=b.invoke(g,V);g(f,".",w,"=",z,";")}})}r.dynamic[l]=new rr.DynamicVariable(jt,{thisDep:c,contextDep:d,propDep:a,ref:f,append:o}),delete r.static[l]}function ye(i,r,l,v,p){var m=be();m.stats=m.link(p),Object.keys(r.static).forEach(function(d){te(m,r,d)}),Qf.forEach(function(d){te(m,i,d)});var c=Pe(i,r,l,v,m);return ke(m,c),E(m,c),u(m,c),J(m.compile(),{destroy:function(){c.shader.program.destroy()}})}return{next:$,current:Q,procs:function(){var i=be(),r=i.proc("poll"),l=i.proc("refresh"),v=i.block();r(v),l(v);var p=i.shared,m=p.gl,c=p.next,d=p.current;v(d,".dirty=false;"),ze(i,r),ze(i,l,null,!0);var a;k&&(a=i.link(k)),s.oes_vertex_array_object&&l(i.link(s.oes_vertex_array_object),".bindVertexArrayOES(null);");for(var f=0;f<y.maxAttributes;++f){var o=l.def(p.attributes,"[",f,"]"),b=i.cond(o,".buffer");b.then(m,".enableVertexAttribArray(",f,");",m,".bindBuffer(",rt,",",o,".buffer.buffer);",m,".vertexAttribPointer(",f,",",o,".size,",o,".type,",o,".normalized,",o,".stride,",o,".offset);").else(m,".disableVertexAttribArray(",f,");",m,".vertexAttrib4f(",f,",",o,".x,",o,".y,",o,".z,",o,".w);",o,".buffer=null;"),l(b),k&&l(a,".vertexAttribDivisorANGLE(",f,",",o,".divisor);")}return l(i.shared.vao,".currentVAO=null;",i.shared.vao,".setVAO(",i.shared.vao,".targetVAO);"),Object.keys(C).forEach(function(g){var w=C[g],V=v.def(c,".",g),z=i.block();z("if(",V,"){",m,".enable(",w,")}else{",m,".disable(",w,")}",d,".",g,"=",V,";"),l(z),r("if(",V,"!==",d,".",g,"){",z,"}")}),Object.keys(S).forEach(function(g){var w=S[g],V=Q[g],z,Y,U=i.block();if(U(m,".",w,"("),Oe(V)){var oe=V.length;z=i.global.def(c,".",g),Y=i.global.def(d,".",g),U(tr(oe,function(ee){return z+"["+ee+"]"}),");",tr(oe,function(ee){return Y+"["+ee+"]="+z+"["+ee+"];"}).join("")),r("if(",tr(oe,function(ee){return z+"["+ee+"]!=="+Y+"["+ee+"]"}).join("||"),"){",U,"}")}else z=v.def(c,".",g),Y=v.def(d,".",g),U(z,");",d,".",g,"=",z,";"),r("if(",z,"!==",Y,"){",U,"}");l(U)}),i.compile()}(),compile:ye}}function hl(){return{vaoCount:0,bufferCount:0,elementsCount:0,framebufferCount:0,shaderCount:0,textureCount:0,cubeCount:0,renderbufferCount:0,maxTextureUnits:0}}var pl=34918,bl=34919,_o=35007,gl=function(e,t){if(!t.ext_disjoint_timer_query)return null;var s=[];function y(){return s.pop()||t.ext_disjoint_timer_query.createQueryEXT()}function L(k){s.push(k)}var x=[];function A(k){var Z=y();t.ext_disjoint_timer_query.beginQueryEXT(_o,Z),x.push(Z),O(x.length-1,x.length,k)}function D(){t.ext_disjoint_timer_query.endQueryEXT(_o)}function F(){this.startQueryIndex=-1,this.endQueryIndex=-1,this.sum=0,this.stats=null}var N=[];function M(){return N.pop()||new F}function P(k){N.push(k)}var H=[];function O(k,Z,R){var Q=M();Q.startQueryIndex=k,Q.endQueryIndex=Z,Q.sum=0,Q.stats=R,H.push(Q)}var B=[],h=[];function T(){var k,Z,R=x.length;if(R!==0){h.length=Math.max(h.length,R+1),B.length=Math.max(B.length,R+1),B[0]=0,h[0]=0;var Q=0;for(k=0,Z=0;Z<x.length;++Z){var $=x[Z];t.ext_disjoint_timer_query.getQueryObjectEXT($,bl)?(Q+=t.ext_disjoint_timer_query.getQueryObjectEXT($,pl),L($)):x[k++]=$,B[Z+1]=Q,h[Z+1]=k}for(x.length=k,k=0,Z=0;Z<H.length;++Z){var se=H[Z],C=se.startQueryIndex,S=se.endQueryIndex;se.sum+=B[S]-B[C];var ae=h[C],j=h[S];j===ae?(se.stats.gpuTime+=se.sum/1e6,P(se)):(se.startQueryIndex=ae,se.endQueryIndex=j,H[k++]=se)}H.length=k}}return{beginQuery:A,endQuery:D,pushScopeStats:O,update:T,getNumPendingQueries:function(){return x.length},clear:function(){s.push.apply(s,x);for(var k=0;k<s.length;k++)t.ext_disjoint_timer_query.deleteQueryEXT(s[k]);x.length=0,s.length=0},restore:function(){x.length=0,s.length=0}}},_l=16384,xl=256,yl=1024,El=34962,xo="webglcontextlost",yo="webglcontextrestored",Eo=1,Tl=2,Al=3;function To(e,t){for(var s=0;s<e.length;++s)if(e[s]===t)return s;return-1}function Sl(e){var t=Eu(e);if(!t)return null;var s=t.gl,y=s.getContextAttributes(),L=s.isContextLost(),x=Tu(s,t);if(!x)return null;var A=bu(),D=hl(),F=x.extensions,N=gl(s,F),M=Gn(),P=s.drawingBufferWidth,H=s.drawingBufferHeight,O={tick:0,time:0,viewportWidth:P,viewportHeight:H,framebufferWidth:P,framebufferHeight:H,drawingBufferWidth:P,drawingBufferHeight:H,pixelRatio:t.pixelRatio},B={},h={elements:null,primitive:4,count:-1,offset:0,instances:-1},T=ls(s,F),k=Ls(s,D,t,Q),Z=Ps(s,F,k,D),R=Mf(s,F,T,D,k,Z,h);function Q(me){return R.destroyBuffer(me)}var $=Hf(s,A,D,t),se=pf(s,F,T,function(){ae.procs.poll()},O,D,t),C=bf(s,F,T,D,t),S=Nf(s,F,T,se,C,D),ae=vl(s,A,F,T,k,Z,se,S,B,R,$,h,O,N,t),j=Wf(s,S,ae.procs.poll,O,y,F,T),I=ae.next,X=s.canvas,W=[],_e=[],be=[],q=[t.onDestroy],K=null;function ve(){if(W.length===0){N&&N.update(),K=null;return}K=va.next(ve),Ye();for(var me=W.length-1;me>=0;--me){var Te=W[me];Te&&Te(O,null,0)}s.flush(),N&&N.update()}function ge(){!K&&W.length>0&&(K=va.next(ve))}function Ee(){K&&(va.cancel(ve),K=null)}function Fe(me){me.preventDefault(),L=!0,Ee(),_e.forEach(function(Te){Te()})}function De(me){s.getError(),L=!1,x.restore(),$.restore(),k.restore(),se.restore(),C.restore(),S.restore(),R.restore(),N&&N.restore(),ae.procs.refresh(),ge(),be.forEach(function(Te){Te()})}X&&(X.addEventListener(xo,Fe,!1),X.addEventListener(yo,De,!1));function Ae(){W.length=0,Ee(),X&&(X.removeEventListener(xo,Fe),X.removeEventListener(yo,De)),$.clear(),S.clear(),C.clear(),R.clear(),se.clear(),Z.clear(),k.clear(),N&&N.clear(),q.forEach(function(me){me()})}function Ue(me){n(!!me,"invalid args to regl({...})"),n.type(me,"object","invalid args to regl({...})");function Te(p){var m=J({},p);delete m.uniforms,delete m.attributes,delete m.context,delete m.vao,"stencil"in m&&m.stencil.op&&(m.stencil.opBack=m.stencil.opFront=m.stencil.op,delete m.stencil.op);function c(d){if(d in m){var a=m[d];delete m[d],Object.keys(a).forEach(function(f){m[d+"."+f]=a[f]})}}return c("blend"),c("depth"),c("cull"),c("stencil"),c("polygonOffset"),c("scissor"),c("sample"),"vao"in p&&(m.vao=p.vao),m}function Le(p,m){var c={},d={};return Object.keys(p).forEach(function(a){var f=p[a];if(rr.isDynamic(f)){d[a]=rr.unbox(f,a);return}else if(m&&Array.isArray(f)){for(var o=0;o<f.length;++o)if(rr.isDynamic(f[o])){d[a]=rr.unbox(f,a);return}}c[a]=f}),{dynamic:d,static:c}}var ke=Le(me.context||{},!0),cr=Le(me.uniforms||{},!0),Ur=Le(me.attributes||{},!1),u=Le(Te(me),!1),E={gpuTime:0,cpuTime:0,count:0},_=ae.compile(u,Ur,cr,ke,E),te=_.draw,ye=_.batch,i=_.scope,r=[];function l(p){for(;r.length<p;)r.push(null);return r}function v(p,m){var c;if(L&&n.raise("context lost"),typeof p=="function")return i.call(this,null,p,0);if(typeof m=="function")if(typeof p=="number")for(c=0;c<p;++c)i.call(this,null,m,c);else if(Array.isArray(p))for(c=0;c<p.length;++c)i.call(this,p[c],m,c);else return i.call(this,p,m,0);else if(typeof p=="number"){if(p>0)return ye.call(this,l(p|0),p|0)}else if(Array.isArray(p)){if(p.length)return ye.call(this,p,p.length)}else return te.call(this,p)}return J(v,{stats:E,destroy:function(){_.destroy()}})}var Ge=S.setFBO=Ue({framebuffer:rr.define.call(null,Eo,"framebuffer")});function Pe(me,Te){var Le=0;ae.procs.poll();var ke=Te.color;ke&&(s.clearColor(+ke[0]||0,+ke[1]||0,+ke[2]||0,+ke[3]||0),Le|=_l),"depth"in Te&&(s.clearDepth(+Te.depth),Le|=xl),"stencil"in Te&&(s.clearStencil(Te.stencil|0),Le|=yl),n(!!Le,"called regl.clear with no buffer specified"),s.clear(Le)}function Ve(me){if(n(typeof me=="object"&&me,"regl.clear() takes an object as input"),"framebuffer"in me)if(me.framebuffer&&me.framebuffer_reglType==="framebufferCube")for(var Te=0;Te<6;++Te)Ge(J({framebuffer:me.framebuffer.faces[Te]},me),Pe);else Ge(me,Pe);else Pe(null,me)}function ze(me){n.type(me,"function","regl.frame() callback must be a function"),W.push(me);function Te(){var Le=To(W,me);n(Le>=0,"cannot cancel a frame twice");function ke(){var cr=To(W,ke);W[cr]=W[W.length-1],W.length-=1,W.length<=0&&Ee()}W[Le]=ke}return ge(),{cancel:Te}}function Xe(){var me=I.viewport,Te=I.scissor_box;me[0]=me[1]=Te[0]=Te[1]=0,O.viewportWidth=O.framebufferWidth=O.drawingBufferWidth=me[2]=Te[2]=s.drawingBufferWidth,O.viewportHeight=O.framebufferHeight=O.drawingBufferHeight=me[3]=Te[3]=s.drawingBufferHeight}function Ye(){O.tick+=1,O.time=xe(),Xe(),ae.procs.poll()}function Ie(){se.refresh(),Xe(),ae.procs.refresh(),N&&N.update()}function xe(){return(Gn()-M)/1e3}Ie();function Qe(me,Te){n.type(Te,"function","listener callback must be a function");var Le;switch(me){case"frame":return ze(Te);case"lost":Le=_e;break;case"restore":Le=be;break;case"destroy":Le=q;break;default:n.raise("invalid event, must be one of frame,lost,restore,destroy")}return Le.push(Te),{cancel:function(){for(var ke=0;ke<Le.length;++ke)if(Le[ke]===Te){Le[ke]=Le[Le.length-1],Le.pop();return}}}}var we=J(Ue,{clear:Ve,prop:rr.define.bind(null,Eo),context:rr.define.bind(null,Tl),this:rr.define.bind(null,Al),draw:Ue({}),buffer:function(me){return k.create(me,El,!1,!1)},elements:function(me){return Z.create(me,!1)},texture:se.create2D,cube:se.createCube,renderbuffer:C.create,framebuffer:S.create,framebufferCube:S.createCube,vao:R.createVAO,attributes:y,frame:ze,on:Qe,limits:T,hasExtension:function(me){return T.extensions.indexOf(me.toLowerCase())>=0},read:j,destroy:Ae,_gl:s,_refresh:Ie,poll:function(){Ye(),N&&N.update()},now:xe,stats:D});return t.onDone(null,we),we}return Sl})});var Vo=Il(Lo());var Co=`
precision highp float;
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`,wo=`
precision highp float;
varying vec2 uv;
uniform sampler2D uTex;
uniform vec2 uTexel;
uniform sampler2D uCurveLUT;   // LUT 256\xD71 das curvas de tom (.r/.g/.b por canal, .a = mestre)
uniform float uCurveOn;        // 1 = aplicar curvas; 0 = ignorar

uniform float uExposure, uContrast, uHighlights, uShadows, uBrightness, uBlackPoint, uBrilliance;
uniform float uSaturation, uVibrance, uTemperature, uTint;
uniform float uBwIntensity, uTonalSeparation, uBlackDepth, uWhiteBoost, uFade;
uniform int uNoirCurve;
uniform float uClarity, uTexture, uSharpness, uDefinition, uNoiseReduction;
uniform float uGrain, uGrainSize, uGrainRoughness, uReferenceWidth, uSeed;
uniform float uIso;          // granula\xE7\xE3o de sensor simulada (0 = ISO 100)
uniform int uGrainType;      // 0 digital, 1 35mm, 2 filme antigo, 3 jornal, 4 cinem\xE1tico
uniform float uVignette, uVignetteSoftness, uVignetteIntensity;
uniform vec2 uVignetteCenter;
uniform int uFilter;
uniform float uFilterIntensity;
uniform vec4 uCropRect;      // x, y, w, h (normalizado na origem)
uniform float uFlipX, uFlipY, uRotate90, uStraighten;
uniform float uCrt, uBurn, uWorn, uHalation, uVhs;   // texturas empilh\xE1veis (0..1)
uniform float uFilmGrain, uDarkGrainy, uConcrete, uGrunge, uGlitch, uDustVintage;
uniform float uSignalLoss, uInterference, uScanlines;
uniform float uLightLeak, uLeakStreak, uLeakRainbow, uLeakEdge, uLeakSpot; // sess\xE3o Leak
uniform float uFilmBloom, uAnamorphic;   // extras de Filme & Gr\xE3o
uniform float uPersonaRed, uPersonaBlue, uDarkKnight, uCyberNeon, uInkToon, uDreadFog; // aberra\xE7\xF5es crom\xE1ticas
uniform float uPixelArt, uGameboy, uThermal, uVaporwave; // efeitos de cor
uniform float uFisheye, uAntiFisheye; // distor\xE7\xE3o de lente radial (barril / pincushion)
// Color grading (split-toning) + Color mixer (HSL)
uniform vec3 uCgShadows, uCgMidtones, uCgHighlights, uCgGlobal;
uniform float uCgShadowsLum, uCgMidtonesLum, uCgHighlightsLum, uCgGlobalLum;
uniform float uHslHue[8];
uniform float uHslSat[8];
uniform float uHslLum[8];

// Geometria do crop (passe 1): rotaciona/espelha/recorta em espa\xE7o UV.
vec2 sampleUv(vec2 uv){
  // Distor\xE7\xE3o radial de lente: barril (uFisheye) e pincushion (uAntiFisheye) combinam
  // num fator assinado. Aplicada antes do crop p/ deformar o quadro final de forma coerente.
  float kLens = uFisheye - uAntiFisheye;
  if (abs(kLens) > 0.0001) {
    vec2 d = uv - 0.5;
    float aspect = uTexel.y / uTexel.x;   // largura/altura \u2192 distor\xE7\xE3o circular, n\xE3o el\xEDptica
    d.x *= aspect;
    float r2 = dot(d, d);
    d *= 1.0 + kLens * 0.6 * r2;           // 0.6 = for\xE7a m\xE1x; >0 estufa (fisheye), <0 contrai
    d.x /= aspect;
    uv = d + 0.5;
  }
  vec2 c = uv - 0.5;
  float ang = uStraighten + uRotate90 * 1.5707963;
  float s = sin(ang), co = cos(ang);
  c = vec2(c.x * co - c.y * s, c.x * s + c.y * co);
  c += 0.5;
  if (uFlipX > 0.5) c.x = 1.0 - c.x;
  if (uFlipY > 0.5) c.y = 1.0 - c.y;
  return uCropRect.xy + c * uCropRect.zw;
}

float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
vec3 toLin(vec3 c){ return pow(max(c, 0.0), vec3(2.2)); }
vec3 toGam(vec3 c){ return pow(max(c, 0.0), vec3(1.0/2.2)); }
float rand(vec2 co){ return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }

float sCurve(float x, float amount){
  return clamp(mix(x, smoothstep(0.0, 1.0, x), amount), 0.0, 1.0);
}

// Convers\xF5es RGB <-> HSL (h,s,l em 0..1) para o Color Mixer.
vec3 rgb2hsl(vec3 c){
  float mx = max(max(c.r, c.g), c.b);
  float mn = min(min(c.r, c.g), c.b);
  float l = (mx + mn) * 0.5;
  float h = 0.0, s = 0.0;
  float d = mx - mn;
  if (d > 1e-5) {
    s = l < 0.5 ? d / (mx + mn) : d / (2.0 - mx - mn);
    if (mx == c.r)      h = mod((c.g - c.b) / d, 6.0);
    else if (mx == c.g) h = (c.b - c.r) / d + 2.0;
    else                h = (c.r - c.g) / d + 4.0;
    h /= 6.0;
  }
  return vec3(h, s, l);
}
float hueToRgb(float p, float q, float t){
  if (t < 0.0) t += 1.0;
  if (t > 1.0) t -= 1.0;
  if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
  if (t < 1.0/2.0) return q;
  if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
  return p;
}
vec3 hsl2rgb(vec3 hsl){
  float h = hsl.x, s = hsl.y, l = hsl.z;
  if (s <= 0.0) return vec3(l);
  float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;
  return vec3(hueToRgb(p, q, h + 1.0/3.0), hueToRgb(p, q, h), hueToRgb(p, q, h - 1.0/3.0));
}

float applyCurve(float x, int curve){
  if (curve == 0) return sCurve(x, 0.25);            // Suave
  if (curve == 1) return sCurve(x, 0.5);             // Cl\xE1ssica
  if (curve == 2) return sCurve(x, 0.95);            // Alta contraste
  if (curve == 3) { float v = sCurve(x, 0.7); return mix(0.06, 0.96, v); } // Cinem\xE1tica
  if (curve == 4) return mix(0.10, 0.88, sCurve(x, 0.2));                  // Vintage
  return x;
}

// Simula\xE7\xF5es de filme Fujifilm (sess\xE3o "fujifilm"): operam sobre a cor pr\xE9-P&B,
// por isso preservam o croma mesmo quando h\xE1 convers\xE3o monocrom\xE1tica anterior.
vec3 applyFuji(vec3 c, int f){
  float l = luma(c);
  vec3 r = c;
  if (f == 9) {                                                            // Provia / Standard
    r = (c - 0.5) * 1.06 + 0.5;
    r = mix(vec3(l), r, 1.08);
  } else if (f == 10) {                                                    // Velvia / Vivid
    r = (c - 0.5) * 1.16 + 0.5;
    r = mix(vec3(l), r, 1.5);
    r *= vec3(1.03, 1.0, 1.02);
  } else if (f == 11) {                                                    // Astia / Soft
    r = (c - 0.5) * 0.92 + 0.5;
    r = mix(vec3(l), r, 1.06);
    r += vec3(0.015, 0.006, 0.0);
  } else if (f == 12) {                                                    // Classic Chrome
    r = mix(vec3(l), c, 0.74);
    r = (r - 0.5) * 1.08 + 0.5;
    r -= (1.0 - smoothstep(0.0, 0.5, l)) * 0.025;
    r += vec3(0.0, 0.0, 0.012);
  } else if (f == 13) {                                                    // Classic Neg
    r = mix(vec3(l), c, 0.95);
    float sh = 1.0 - smoothstep(0.0, 0.5, l);
    float hi = smoothstep(0.5, 1.0, l);
    r += vec3(0.0, sh * 0.03, sh * 0.025);                                 // sombras teal/verde
    r += vec3(hi * 0.035, hi * 0.012, 0.0);                               // realces quentes
    r = (r - 0.5) * 1.1 + 0.5;
  } else if (f == 14) {                                                    // Eterna / Cinema
    r = mix(vec3(l), c, 0.58);
    r = (r - 0.5) * 0.9 + 0.5;
    r = r * 0.9 + 0.06;                                                    // levanta sombras (fade)
    r += vec3(0.0, 0.0, 0.012);
  } else if (f == 15) {                                                    // Nostalgic Neg
    r = mix(vec3(l), c, 0.85);
    float hi = smoothstep(0.45, 1.0, l);
    r += vec3(hi * 0.05, hi * 0.025, 0.0);                                // realces \xE2mbar
    r = r * 0.94 + 0.04;
  } else if (f == 16) {                                                    // ACROS (P&B)
    r = vec3(sCurve(l, 0.7));
  }
  return clamp(r, 0.0, 1.0);
}

// Sess\xE3o Cinematogr\xE1fico: grada\xE7\xF5es de cor inspiradas em cinema.
vec3 applyCine(vec3 c, int f){
  float l = luma(c);
  vec3 r = c;
  float lo = 1.0 - smoothstep(0.0, 0.5, l);                              // sombras
  float hi = smoothstep(0.4, 1.0, l);                                    // luzes
  if (f == 17) {                                                          // Teal & Orange
    r += vec3(-0.02, 0.01, 0.05) * lo;
    r += vec3(0.06, 0.02, -0.04) * hi;
    r = (r - 0.5) * 1.12 + 0.5;
    r = mix(vec3(l), r, 1.06);
  } else if (f == 18) {                                                   // Bleach Bypass
    r = mix(vec3(l), c, 0.4);
    r = (r - 0.5) * 1.3 + 0.5;
    r = mix(r, vec3(luma(r)), 0.12);
  } else if (f == 19) {                                                   // Day for Night
    r = mix(vec3(l), c, 0.7);
    r *= 0.6;
    r += vec3(0.0, 0.02, 0.09) * (1.0 - l);
    r = (r - 0.5) * 1.1 + 0.5;
  } else if (f == 20) {                                                   // Thriller
    r = mix(vec3(l), c, 0.62);
    r += vec3(-0.02, 0.03, -0.02);
    r.g += lo * 0.03;
    r = (r - 0.5) * 1.08 + 0.5;
    r *= 0.93;
  } else if (f == 21) {                                                   // Golden Hour
    r = mix(vec3(l), c, 1.08);
    r += vec3(0.06, 0.03, -0.03) * hi;
    r += vec3(0.02, 0.005, -0.01);
    r = (r - 0.5) * 1.08 + 0.5;
  }
  return clamp(r, 0.0, 1.0);
}

// Sess\xE3o Aesthetic: est\xE9ticas suaves e contempor\xE2neas para redes sociais.
vec3 applyAesthetic(vec3 c, int f){
  float l = luma(c);
  vec3 r = c;
  float hi = smoothstep(0.4, 1.0, l);
  if (f == 22) {                                                          // Pastel Dream
    r = mix(vec3(l), c, 0.78);
    r = (r - 0.5) * 0.85 + 0.5;
    r = r * 0.9 + 0.08;
    r += vec3(0.025, 0.0, 0.025) * hi;
  } else if (f == 23) {                                                   // Faded Matte
    r = mix(vec3(l), c, 0.85);
    r = r * 0.85 + 0.12;
    r = (r - 0.5) * 0.92 + 0.5;
    r += vec3(0.012, 0.0, 0.012);
  } else if (f == 24) {                                                   // Moody
    r = mix(vec3(l), c, 0.68);
    r = (r - 0.5) * 1.12 + 0.5;
    r -= (1.0 - smoothstep(0.0, 0.45, l)) * 0.05;
    r += vec3(-0.01, 0.0, 0.025) * (1.0 - l);
    r *= 0.95;
  } else if (f == 25) {                                                   // Clean & Bright
    r = mix(vec3(l), c, 1.08);
    r = r * 0.96 + 0.04;
    r += hi * 0.04;
    r = (r - 0.5) * 1.02 + 0.5;
  } else if (f == 26) {                                                   // Warm Peach
    r = mix(vec3(l), c, 0.9);
    r += vec3(0.045, 0.018, -0.012);
    r = r * 0.92 + 0.06;
  }
  return clamp(r, 0.0, 1.0);
}

// Sess\xE3o Vintage: filmes coloridos retr\xF4 (s\xE9pia em monocrom\xE1tico quente).
vec3 applyVintage(vec3 c, int f){
  float l = luma(c);
  vec3 r = c;
  float hi = smoothstep(0.45, 1.0, l);
  float lo = 1.0 - smoothstep(0.0, 0.5, l);
  if (f == 27) {                                                          // Anos 70
    r = mix(vec3(l), c, 0.8);
    r += vec3(0.05, 0.02, -0.05);
    r = r * 0.85 + 0.1;
    r = (r - 0.5) * 0.92 + 0.5;
  } else if (f == 28) {                                                   // Polaroid
    r = mix(vec3(l), c, 0.82);
    r += vec3(-0.012, 0.02, 0.012);
    r += vec3(0.03, 0.02, -0.02) * hi;
    r = r * 0.88 + 0.1;
  } else if (f == 29) {                                                   // S\xE9pia
    r = vec3(l) * vec3(1.12, 0.94, 0.66);
    r = (r - 0.5) * 1.04 + 0.5;
  } else if (f == 30) {                                                   // Kodachrome
    r = mix(vec3(l), c, 1.28);
    r = (r - 0.5) * 1.12 + 0.5;
    r *= vec3(1.04, 0.99, 1.02);
  } else if (f == 31) {                                                   // Cross Process
    r = mix(vec3(l), c, 1.1);
    r += vec3(-0.02, 0.0, 0.05) * lo;
    r += vec3(0.045, 0.045, -0.045) * hi;
    r = (r - 0.5) * 1.15 + 0.5;
  }
  return clamp(r, 0.0, 1.0);
}

// Sess\xE3o Nostalgic: fotos antigas lavadas \u2014 pretos levantados, baixo contraste,
// cor dessaturada e dominantes sutis (est\xE9tica VSCO / anos 90).
vec3 applyNostalgic(vec3 c, int f){
  float l = luma(c);
  vec3 r = c;
  float hi = smoothstep(0.5, 1.0, l);
  float lo = 1.0 - smoothstep(0.0, 0.5, l);
  if (f == 32) {                                                          // Anos 90 Lavado
    r = mix(vec3(l), c, 0.72);                                            // dessatura
    r = (r - 0.5) * 0.86 + 0.5;                                          // baixo contraste
    r = r * 0.82 + 0.14;                                                 // fade forte
    r += vec3(0.028, 0.012, -0.018);                                    // dominante quente sutil
  } else if (f == 33) {                                                   // Filme Lavado (frio)
    r = mix(vec3(l), c, 0.7);
    r = (r - 0.5) * 0.88 + 0.5;
    r = r * 0.85 + 0.12;                                                 // fade frio
    r += vec3(-0.02, 0.0, 0.03) * lo;                                   // sombras azuladas
    r += vec3(0.0, 0.01, 0.022) * hi;                                   // luzes levemente frias
  } else if (f == 34) {                                                   // C\xE2mera Descart\xE1vel
    r = mix(vec3(l), c, 0.9);
    r += vec3(-0.012, 0.026, -0.012) * lo;                              // sombras esverdeadas
    r += vec3(0.042, 0.03, -0.02) * hi;                                // luzes amareladas (flash)
    r = r * 0.9 + 0.08;
    r = (r - 0.5) * 1.05 + 0.5;                                         // leve punch de flash
  } else if (f == 35) {                                                   // Suave Fosco (VSCO)
    r = mix(vec3(l), c, 0.58);                                           // bem dessaturado
    r = (r - 0.5) * 0.9 + 0.5;
    r = r * 0.84 + 0.13;                                                 // matte
    r += vec3(0.01, 0.0, 0.014);                                        // magenta/roxo sutil
  } else if (f == 36) {                                                   // Desbotado ao Sol
    r = mix(vec3(l), c, 0.64);
    r += vec3(0.05, 0.022, 0.0) * hi;                                   // realces \xE2mbar
    r += vec3(0.022, 0.0, 0.016) * lo;                                 // sombras magenta desbotadas
    r = r * 0.8 + 0.16;                                                  // fade extremo
    r = (r - 0.5) * 0.85 + 0.5;
  }
  return clamp(r, 0.0, 1.0);
}

// Editorial: controlled contrast and restrained color for portraits and print-like finishes.
vec3 applyEditorial(vec3 c, int f){
  float l = luma(c);
  float hi = smoothstep(0.45, 1.0, l);
  float lo = 1.0 - smoothstep(0.0, 0.55, l);
  vec3 r = c;
  if (f == 37) {                                                        // Porcelain
    r = mix(vec3(l), c, 0.78);
    r = (r - 0.5) * 0.90 + 0.5;
    r += vec3(0.022, 0.012, 0.005) * lo;
    r = mix(r, vec3(0.98, 0.965, 0.95), hi * 0.10);
  } else if (f == 38) {                                                 // Satin
    r = mix(vec3(l), c, 0.86);
    r = r * 0.92 + 0.045;
    r += vec3(-0.014, 0.0, 0.022) * lo;
    r += vec3(0.025, 0.012, -0.01) * hi;
  } else if (f == 39) {                                                 // Graphite
    float tone = sCurve(l, 0.62);
    tone = (tone - 0.5) * 1.12 + 0.5;
    r = vec3(tone) + vec3(-0.008, 0.0, 0.014) * hi;
  } else if (f == 40) {                                                 // Champagne
    r = mix(vec3(l), c, 0.94);
    r = (r - 0.5) * 0.98 + 0.5;
    r += vec3(0.045, 0.022, -0.018) * hi;
    r += vec3(0.012, 0.003, -0.006) * lo;
  }
  return clamp(r, 0.0, 1.0);
}

// Laboratory: tonal reinterpretations of darkroom processes, using the same export pipeline.
vec3 applyLaboratory(vec3 c, int f){
  float l = luma(c);
  float tone = sCurve(l, 0.40);
  vec3 r = c;
  if (f == 41) {                                                        // Cyanotype
    r = mix(vec3(0.012, 0.045, 0.19), vec3(0.96, 0.975, 0.93), pow(tone, 1.12));
  } else if (f == 42) {                                                 // Selenium
    r = mix(vec3(0.045, 0.028, 0.060), vec3(0.955, 0.960, 0.98), tone);
    r = (r - 0.5) * 1.08 + 0.5;
  } else if (f == 43) {                                                 // Lith
    tone = pow(sCurve(l, 0.92), 0.88);
    r = mix(vec3(0.055, 0.026, 0.012), vec3(0.985, 0.88, 0.67), tone);
  } else if (f == 44) {                                                 // Solarization
    tone = l <= 0.62 ? l / 0.62 : 1.0 - (l - 0.62) / 0.38;
    r = vec3(sCurve(tone, 0.45)) * vec3(0.98, 1.0, 1.015);
  }
  return clamp(r, 0.0, 1.0);
}

vec3 applyFilter(vec3 c, vec3 colorBase, int f, float t){
  if (f == 0) return c;
  vec3 r = c;
  if (f >= 41) {                                                        // Laboratory
    r = applyLaboratory(colorBase, f);
  } else if (f >= 37) {                                                 // Editorial
    r = applyEditorial(colorBase, f);
  } else if (f >= 32) {                                                   // Sess\xE3o Nostalgic (cor)
    r = applyNostalgic(colorBase, f);
  } else if (f >= 27) {                                                   // Sess\xE3o Vintage (cor)
    r = applyVintage(colorBase, f);
  } else if (f >= 22) {                                                   // Sess\xE3o Aesthetic (cor)
    r = applyAesthetic(colorBase, f);
  } else if (f >= 17) {                                                   // Sess\xE3o Cinematogr\xE1fico (cor)
    r = applyCine(colorBase, f);
  } else if (f >= 9) {                                                    // Sess\xE3o Fujifilm (cor)
    r = applyFuji(colorBase, f);
  } else {                                                                // Sess\xE3o Noir (P&B)
    float l = luma(c);
    if (f == 1) { l = sCurve(l, 0.95); r = vec3(l); }                       // P&B alto contraste
    else if (f == 2) { l = mix(0.08, 0.95, sCurve(l, 0.35)); r = vec3(l) * vec3(0.99,1.0,1.02); } // Tons de prata
    else if (f == 3) { l = mix(0.12, 0.86, sCurve(l, 0.25)); r = vec3(l) * vec3(1.03,1.0,0.95); } // Vintage
    else if (f == 4) { l = sCurve(l, 0.45); r = vec3(l); }                  // Mono
    else if (f == 5) { l = sCurve(l, 0.55); r = vec3(l); }                  // Tonal
    else if (f == 6) { l = sCurve(l, 0.9); r = vec3(l) * vec3(0.98,0.99,1.0); } // Noir
    else if (f == 7) { l = mix(0.04, 1.0, sCurve(l, 0.6)); r = vec3(l) * vec3(0.97,1.0,1.05); } // Silvertone
    else if (f == 8) { l = sCurve(l, 0.85); l = floor(l*9.0)/9.0; r = vec3(l); } // Jornal noir
  }
  return mix(c, r, clamp(t, 0.0, 1.0));
}

void main(){
  vec2 suv = sampleUv(uv);
  vec3 c = texture2D(uTex, suv).rgb;
  vec3 srcColor = c;   // origem crua preservada (aberra\xE7\xE3o/hala\xE7\xE3o dos shaders)

  // Vizinhan\xE7a pr\xF3xima (1px): nitidez / defini\xE7\xE3o / textura / redu\xE7\xE3o de ru\xEDdo.
  vec3 n = texture2D(uTex, sampleUv(uv + vec2(0.0, -uTexel.y))).rgb
         + texture2D(uTex, sampleUv(uv + vec2(0.0,  uTexel.y))).rgb
         + texture2D(uTex, sampleUv(uv + vec2(-uTexel.x, 0.0))).rgb
         + texture2D(uTex, sampleUv(uv + vec2( uTexel.x, 0.0))).rgb;
  vec3 blur = (c + n) / 5.0;
  vec3 highFreq = c - blur;
  // Vizinhan\xE7a larga (~4px): claridade = contraste local (muito mais vis\xEDvel que micro).
  vec3 nw = texture2D(uTex, sampleUv(uv + vec2(0.0, -uTexel.y * 4.0))).rgb
          + texture2D(uTex, sampleUv(uv + vec2(0.0,  uTexel.y * 4.0))).rgb
          + texture2D(uTex, sampleUv(uv + vec2(-uTexel.x * 4.0, 0.0))).rgb
          + texture2D(uTex, sampleUv(uv + vec2( uTexel.x * 4.0, 0.0))).rgb;
  vec3 localContrast = c - (c + nw) / 5.0;

  // Redu\xE7\xE3o de ru\xEDdo
  c = mix(c, blur, uNoiseReduction * 0.85);
  // Nitidez + defini\xE7\xE3o + textura (microcontraste) \u2014 resposta refor\xE7ada.
  c = c + highFreq * (uSharpness * 2.6 + uDefinition * 1.7 + uTexture * 1.5);
  // Claridade: contraste local de raio maior (efeito percept\xEDvel).
  c = c + localContrast * (uClarity * 1.8);
  c = clamp(c, 0.0, 1.0);

  // ---- Luz (em espa\xE7o linear para exposi\xE7\xE3o/temperatura) ----
  vec3 lin = toLin(c);
  lin *= pow(2.0, uExposure * 1.6);
  lin.r += uTemperature * 0.12; lin.b -= uTemperature * 0.12;
  lin.g -= uTint * 0.10;        lin.r += uTint * 0.04; lin.b += uTint * 0.04;
  vec3 g = toGam(max(lin, 0.0));

  float L = luma(g);
  g += uShadows * (1.0 - smoothstep(0.0, 0.55, L)) * 0.5;
  g += uHighlights * smoothstep(0.45, 1.0, L) * 0.45;
  g += uBrightness * 0.28;
  g += uBrilliance * ((1.0 - L) * 0.30 - smoothstep(0.6, 1.0, L) * 0.16);
  g = (g - 0.5) * (1.0 + uContrast) + 0.5;
  float bp = uBlackPoint * 0.16;
  g = (g - bp) / max(1.0 - bp, 0.05);
  g = clamp(g, 0.0, 1.0);

  // ---- Curvas de tom (LUT) \u2014 mestre (canal .a) por componente, depois a curva do componente ----
  if (uCurveOn > 0.5) {
    float mr = texture2D(uCurveLUT, vec2(g.r, 0.5)).a;
    float mg = texture2D(uCurveLUT, vec2(g.g, 0.5)).a;
    float mb = texture2D(uCurveLUT, vec2(g.b, 0.5)).a;
    g = vec3(
      texture2D(uCurveLUT, vec2(mr, 0.5)).r,
      texture2D(uCurveLUT, vec2(mg, 0.5)).g,
      texture2D(uCurveLUT, vec2(mb, 0.5)).b
    );
  }

  // ---- Cor (antes da convers\xE3o) ----
  float lc = luma(g);
  g = mix(vec3(lc), g, 1.0 + uSaturation);
  float sat = max(max(g.r, g.g), g.b) - min(min(g.r, g.g), g.b);
  g = mix(vec3(lc), g, 1.0 + uVibrance * (1.0 - sat));
  g = clamp(g, 0.0, 1.0);

  // ---- Color Mixer (HSL) \u2014 por faixa de matiz, antes da convers\xE3o P&B ----
  {
    vec3 hsl = rgb2hsl(g);
    float centers[8];
    centers[0]=0.0;     centers[1]=0.08333; centers[2]=0.16667; centers[3]=0.33333;
    centers[4]=0.5;     centers[5]=0.66667; centers[6]=0.77778; centers[7]=0.88889;
    float hueShift = 0.0, satAdj = 0.0, lumAdj = 0.0, wsum = 0.0;
    for (int i = 0; i < 8; i++) {
      float dh = abs(hsl.x - centers[i]);
      dh = min(dh, 1.0 - dh);                  // dist\xE2ncia circular de matiz
      float w = smoothstep(0.16667, 0.0, dh);  // ~60\xB0 de alcance, falloff suave
      hueShift += uHslHue[i] * w;
      satAdj   += uHslSat[i] * w;
      lumAdj   += uHslLum[i] * w;
      wsum += w;
    }
    if (wsum > 1e-4) {
      hsl.x = fract(hsl.x + hueShift * 0.15);
      hsl.y = clamp(hsl.y * (1.0 + satAdj), 0.0, 1.0);   // multiplicativo: cinzas seguem cinzas
      hsl.z = clamp(hsl.z + lumAdj * 0.5 * hsl.y, 0.0, 1.0); // s\xF3 afeta pixels coloridos
      g = clamp(hsl2rgb(hsl), 0.0, 1.0);
    }
  }

  // ---- Modelagem tonal + Preto e branco ----
  // A modelagem tonal (separa\xE7\xE3o, pretos, brancos, fade) age na PR\xD3PRIA cor \u2014 assim a
  // se\xE7\xE3o afeta a foto mesmo sem desaturar (Intensidade P&B baixa). A Intensidade P&B
  // desatura para cinza; a Curva Noir molda o canal P&B.
  vec3 toned = (g - 0.5) * (1.0 + uTonalSeparation * 0.9) + 0.5;
  float lt = luma(toned);
  toned -= uBlackDepth * 0.32 * (1.0 - smoothstep(0.0, 0.5, lt));
  toned += uWhiteBoost * 0.30 * smoothstep(0.5, 1.0, lt);
  toned = mix(toned, 0.12 + toned * 0.86, uFade);
  toned = clamp(toned, 0.0, 1.0);
  float bw = applyCurve(luma(toned), uNoirCurve);
  vec3 outc = mix(toned, vec3(bw), uBwIntensity);

  // ---- Filtro (Noir P&B ou simula\xE7\xE3o de filme Fujifilm) ----
  // 'g' \xE9 a cor j\xE1 graduada (pr\xE9-P&B): filtros Fujifilm a usam para preservar o croma.
  outc = applyFilter(outc, g, uFilter, uFilterIntensity);

  // ---- Color Grading (split-toning) \u2014 ap\xF3s P&B: tinge sombras/m\xE9dios/realces/global ----
  {
    float Lg = luma(outc);
    float wS = 1.0 - smoothstep(0.0, 0.5, Lg);
    float wH = smoothstep(0.5, 1.0, Lg);
    float wM = 1.0 - wS - wH;
    outc += (uCgShadows * wS + uCgMidtones * wM + uCgHighlights * wH + uCgGlobal) * 0.6;
    outc += vec3(uCgShadowsLum * wS + uCgMidtonesLum * wM + uCgHighlightsLum * wH + uCgGlobalLum) * 0.5;
    outc = clamp(outc, 0.0, 1.0);
  }

  // ---- Granula\xE7\xE3o (Granula\xE7\xE3o + ISO simulado; car\xE1ter por Tipo de Gr\xE3o) ----
  float grainAmt = clamp(uGrain + uIso * 0.7, 0.0, 1.4); // ISO adiciona ru\xEDdo de sensor
  if (grainAmt > 0.001) {
    float sizeScale = max(uGrainSize, 0.5);
    float rough = clamp(uGrainRoughness, 0.0, 1.0);
    float strength = 0.40;       // 35mm (padr\xE3o)
    float shadowBias = 0.0;      // 0 = m\xE9dios; 1 = concentra nas sombras
    if (uGrainType == 0) { sizeScale *= 0.7; strength = 0.30; }                                   // Digital: fino e sutil
    else if (uGrainType == 2) { sizeScale *= 1.8; rough = max(rough, 0.6); strength = 0.6; shadowBias = 0.55; } // Filme antigo: grosso, nas sombras
    else if (uGrainType == 3) { sizeScale *= 1.3; strength = 0.85; }                              // Jornal noir: duro/dithered
    else if (uGrainType == 4) { sizeScale *= 0.85; strength = 0.30; }                             // Cinem\xE1tico: fino nos m\xE9dios
    vec2 gcoord = uv * (uReferenceWidth / sizeScale) + uSeed;
    float fine = rand(gcoord) - 0.5;
    float coarse = rand(floor(gcoord * 0.45)) - 0.5;
    float grain = mix(fine, coarse, rough);
    if (uGrainType == 3) grain = sign(grain) * step(0.15, abs(grain)) * 0.5; // dither de jornal
    float midMask = 1.0 - abs(luma(outc) - 0.45) * 1.4;
    float shadMask = 1.0 - smoothstep(0.0, 0.6, luma(outc));
    float lmask = mix(midMask, shadMask, shadowBias);
    outc += grain * grainAmt * strength * clamp(lmask, 0.15, 1.0);
  }

  // ---- Vinheta ----
  if (abs(uVignette) > 0.001) {
    float dist = distance(uv, uVignetteCenter) * 1.41421;
    float inner = mix(0.9, 0.2, uVignetteSoftness);
    float v = smoothstep(inner, 1.05, dist) * uVignetteIntensity;
    outc *= 1.0 - v * uVignette;
  }

  // ===== Shaders de textura / tela (empilh\xE1veis, s\xF3 nesta foto) =====
  // Offsets em espa\xE7o UV (fra\xE7\xF5es) \u2192 id\xEAnticos no preview e no export (WYSIWYG).
  float edist = distance(uv, vec2(0.5)) * 1.41421356;

  // Hala\xE7\xE3o: brilho anal\xF3gico que vaza das altas luzes (glow quente).
  if (uHalation > 0.001) {
    vec3 bloom = texture2D(uTex, sampleUv(uv + vec2( 0.012, 0.0))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(-0.012, 0.0))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(0.0,  0.012))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(0.0, -0.012))).rgb
               + texture2D(uTex, sampleUv(uv + vec2( 0.008,  0.008))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(-0.008, -0.008))).rgb;
    bloom /= 6.0;
    float hl = smoothstep(0.55, 1.0, luma(bloom));
    outc += bloom * hl * uHalation * vec3(0.95, 0.62, 0.5);
  }

  // CRT: aberra\xE7\xE3o crom\xE1tica + scanlines + m\xE1scara de f\xF3sforo + curvatura escura.
  if (uCrt > 0.001) {
    float ab = uCrt * (0.0025 + edist * 0.004);
    float rC = texture2D(uTex, sampleUv(uv + vec2(ab, 0.0))).r;
    float bC = texture2D(uTex, sampleUv(uv - vec2(ab, 0.0))).b;
    outc += vec3(rC - srcColor.r, 0.0, bC - srcColor.b) * 0.9;
    float scan = 0.5 + 0.5 * sin(uv.y * 480.0 * 3.14159265);
    outc *= 1.0 - uCrt * 0.28 * scan;
    float triad = mod(floor(uv.x * 540.0), 3.0);
    vec3 mask = vec3(0.82);
    if (triad < 0.5) mask.r = 1.0; else if (triad < 1.5) mask.g = 1.0; else mask.b = 1.0;
    outc *= mix(vec3(1.0), mask, uCrt * 0.5);
    outc *= 1.0 - uCrt * 0.30 * smoothstep(0.55, 1.05, edist);
  }

  // VHS: sangramento de croma horizontal + jitter por linha + faixas de tracking.
  if (uVhs > 0.001) {
    float row = floor(uv.y * 240.0);
    float jit = rand(vec2(row, 7.0)) - 0.5;
    float dxv = uVhs * (0.006 + jit * 0.012);
    float rV = texture2D(uTex, sampleUv(uv + vec2(dxv, 0.0))).r;
    float bV = texture2D(uTex, sampleUv(uv - vec2(dxv, 0.0))).b;
    outc += vec3(rV - srcColor.r, 0.0, bV - srcColor.b) * 1.1;
    float band = smoothstep(0.992, 1.0, rand(vec2(row * 0.13, 3.0)));
    outc += band * uVhs * 0.18;
    outc *= 1.0 - uVhs * 0.10 * (0.5 + 0.5 * sin(uv.y * 240.0 * 3.14159265));
  }

  // Queimado: bordas chamuscadas crescendo das bordas com limite irregular.
  if (uBurn > 0.001) {
    float n1 = rand(floor(uv * 7.0));
    float n2 = rand(floor(uv * 23.0));
    float edge = smoothstep(0.30, 1.0, edist + (n1 - 0.5) * 0.35 + (n2 - 0.5) * 0.12);
    float scorch = edge * uBurn;
    float ember = smoothstep(0.25, 0.7, scorch) * (1.0 - smoothstep(0.7, 1.0, scorch));
    outc += ember * uBurn * vec3(0.55, 0.22, 0.04);                  // anel de brasa
    outc = mix(outc, outc * vec3(0.20, 0.10, 0.04), smoothstep(0.5, 1.0, scorch)); // carv\xE3o marrom
    outc *= 1.0 - smoothstep(0.45, 1.0, scorch) * 0.85;              // escurecimento
  }

  // Desgastado: fade, leve s\xE9pia, poeira e arranh\xF5es verticais (posi\xE7\xE3o est\xE1vel).
  if (uWorn > 0.001) {
    outc = mix(outc, outc * 0.85 + 0.13, uWorn * 0.5);               // fade (levanta os pretos)
    float wl = luma(outc);
    outc = mix(outc, vec3(wl) * vec3(1.12, 1.02, 0.82), uWorn * 0.35); // s\xE9pia suave
    float dust = rand(floor(uv * vec2(260.0, 320.0)));
    outc += step(0.9965, dust) * (1.0 - outc) * uWorn;               // poeira clara
    outc -= step(dust, 0.0035) * outc * uWorn;                       // pontos escuros
    float scr = rand(vec2(floor(uv.x * 200.0), 4.0));
    outc += smoothstep(0.991, 1.0, scr) * (1.0 - outc) * 0.6 * uWorn; // arranh\xE3o vertical
  }

  // Gr\xE3o de filme: ru\xEDdo de lumin\xE2ncia de duas frequ\xEAncias, mais forte nos m\xE9dios.
  if (uFilmGrain > 0.001) {
    vec2 fco = uv * (uReferenceWidth / 2.2) + uSeed;
    float g1 = rand(fco) - 0.5;
    float g2 = rand(fco * 1.7 + 5.0) - 0.5;
    float grain = (g1 + g2) * 0.5;
    float lmask = 1.0 - abs(luma(outc) - 0.5) * 1.2;
    outc += grain * uFilmGrain * 0.22 * clamp(lmask, 0.2, 1.0);
  }

  // Escuro e granulado: escurece, refor\xE7a o contraste e empilha gr\xE3o pesado.
  if (uDarkGrainy > 0.001) {
    outc = mix(outc, outc * 0.55, uDarkGrainy);                       // escurecer
    outc = mix(outc, (outc - 0.5) * 1.2 + 0.5, uDarkGrainy * 0.7);    // contraste
    vec2 dco = uv * (uReferenceWidth / 1.7) + uSeed * 1.3;
    float dg = rand(dco) - 0.5;
    outc += dg * uDarkGrainy * 0.34;                                  // gr\xE3o pesado
  }

  // Parede de concreto: textura mosqueada multi-frequ\xEAncia em multiplica\xE7\xE3o.
  if (uConcrete > 0.001) {
    float c1 = rand(floor(uv * 90.0));
    float c2 = rand(floor(uv * 230.0));
    float c3 = rand(floor(uv * 28.0));
    float tex = c1 * 0.5 + c2 * 0.3 + c3 * 0.2;
    float mottle = mix(0.78, 1.08, tex);
    outc = mix(outc, outc * mottle, uConcrete * 0.85);
    outc -= smoothstep(0.86, 1.0, c3) * uConcrete * 0.15;            // manchas escuras
  }

  // Grunge: manchas sujas, riscos, granulado seco e leve dessatura\xE7\xE3o.
  if (uGrunge > 0.001) {
    float b1 = rand(floor(uv * 14.0));
    float b2 = rand(floor(uv * 47.0));
    float blot = smoothstep(0.55, 1.0, b1 * 0.6 + b2 * 0.4);
    outc = mix(outc, outc * 0.45, blot * uGrunge);                   // manchas escuras
    float scrg = rand(vec2(floor(uv.x * 130.0), 9.0));
    outc -= smoothstep(0.985, 1.0, scrg) * uGrunge * 0.5;            // riscos
    float gn = rand(uv * uReferenceWidth * 0.5 + uSeed) - 0.5;
    outc += gn * uGrunge * 0.12;                                     // granulado seco
    outc = mix(outc, vec3(luma(outc)) * vec3(1.02, 1.0, 0.95), uGrunge * 0.3);
  }

  // An\xE1glifo 3D ("glitch"): c\xF3pias deslocadas em sentidos opostos geram franjas vermelha
  // (lado direito) e azul (lado esquerdo), como uma imagem de \xF3culos 3D vista sem os \xF3culos.
  // Baseado em deltas de lumin\xE2ncia da fonte \u2192 franjas s\xF3 nas BORDAS; \xE1reas chapadas ficam
  // intactas (sem blocos brancos) e independe do grade/P&B aplicado.
  if (uGlitch > 0.001) {
    float d = uGlitch * 0.03;                                              // deslocamento horizontal
    float l0 = luma(srcColor);                                            // lumin\xE2ncia base (sem deslocar)
    float lr = luma(texture2D(uTex, sampleUv(uv + vec2(d, 0.0))).rgb);    // c\xF3pia deslocada p/ direita
    float lb = luma(texture2D(uTex, sampleUv(uv - vec2(d, 0.0))).rgb);    // c\xF3pia deslocada p/ esquerda
    outc.r += (lr - l0) * uGlitch * 1.1;                                  // franja vermelha
    outc.b += (lb - l0) * uGlitch * 1.1;                                  // franja azul
    outc = clamp(outc, 0.0, 1.0);
  }

  // Poeira e gr\xE3o vintage: fade quente + gr\xE3o de filme + poeira e arranh\xF5es.
  if (uDustVintage > 0.001) {
    outc = mix(outc, outc * 0.88 + 0.10, uDustVintage * 0.6);         // fade
    float dvl = luma(outc);
    outc = mix(outc, vec3(dvl) * vec3(1.10, 1.02, 0.86), uDustVintage * 0.3); // s\xE9pia suave
    vec2 vco = uv * (uReferenceWidth / 2.0) + uSeed;
    outc += (rand(vco) - 0.5) * uDustVintage * 0.18;                 // gr\xE3o de filme
    float dv = rand(floor(uv * vec2(300.0, 360.0)) + uSeed * 0.7);
    outc += step(0.9965, dv) * (1.0 - outc) * uDustVintage;          // poeira clara
    outc -= step(dv, 0.0035) * outc * uDustVintage;                  // pontos escuros
    float scrv = rand(vec2(floor(uv.x * 220.0), 4.0));
    outc += smoothstep(0.992, 1.0, scrv) * (1.0 - outc) * 0.5 * uDustVintage; // arranh\xE3o
  }

  // Perda de sinal: rasgos horizontais por faixa, quedas em preto e linha de sincronismo.
  if (uSignalLoss > 0.001) {
    float band = floor(uv.y * 18.0);
    float tr = rand(vec2(band, uSeed + 1.0));
    float active = step(0.55, tr);
    float tear = active * (rand(vec2(band, 3.0)) - 0.5) * uSignalLoss * 0.18;
    vec3 s = texture2D(uTex, sampleUv(uv + vec2(tear, 0.0))).rgb;
    outc = mix(outc, s, active * uSignalLoss);                              // rasgo horizontal
    float ca = uSignalLoss * 0.02;
    outc.r = mix(outc.r, texture2D(uTex, sampleUv(uv + vec2(tear + ca, 0.0))).r, active * uSignalLoss); // croma deslocado
    float drop = rand(vec2(floor(uv.y * 40.0), uSeed * 1.7));
    outc *= 1.0 - step(0.9, drop) * uSignalLoss;                            // quedas (faixas pretas)
    float syncLine = step(0.985, rand(vec2(floor(uv.y * 70.0), uSeed)));
    outc += syncLine * uSignalLoss * 0.5;                                   // linha brilhante de sync
  }

  // Interfer\xEAncia: chuvisco (snow) anal\xF3gico, barras horizontais de ru\xEDdo e fantasma de croma.
  if (uInterference > 0.001) {
    float snow = rand(uv * uReferenceWidth * 0.8 + uSeed * 2.0) - 0.5;
    outc += snow * uInterference * 0.45;                                    // chuvisco
    float hum = 0.5 + 0.5 * sin(uv.y * 200.0 + uSeed);
    outc *= 1.0 - uInterference * 0.12 * hum;                              // barras horizontais
    vec3 ghost = texture2D(uTex, sampleUv(uv + vec2(uInterference * 0.03, 0.0))).rgb;
    outc = mix(outc, max(outc, ghost), uInterference * 0.35);              // fantasma de croma
  }

  // Scanlines: linhas horizontais de monitor (sem a aberra\xE7\xE3o crom\xE1tica do CRT).
  if (uScanlines > 0.001) {
    float sl = 0.5 + 0.5 * sin(uv.y * 600.0 * 3.14159265);
    outc *= 1.0 - uScanlines * 0.5 * sl;                                    // escurece as linhas
    outc += uScanlines * 0.04 * (1.0 - sl);                                // leve realce entre linhas
  }

  // ===== Aberra\xE7\xF5es crom\xE1ticas e efeitos de cor =====

  // Fantasma Vermelho (JRPG estiloso, ex. Persona 5): eco/silhueta vermelha deslocada + duotone carmesim.
  if (uPersonaRed > 0.001) {
    float p = uPersonaRed;
    vec2 off = vec2(0.022, -0.016) * p;
    float l0 = luma(srcColor);
    float le = luma(texture2D(uTex, sampleUv(uv + off)).rgb);
    float ghost = clamp((le - l0) * 1.6 + abs(le - l0) * 0.6, 0.0, 1.0);   // eco do deslocado
    float lq = luma(outc);
    vec3 duo = mix(vec3(0.03, 0.0, 0.015), vec3(1.0, 0.16, 0.16), smoothstep(0.18, 0.82, lq));
    outc = mix(outc, duo, p * 0.5);                                        // estilo vermelho/preto
    outc += vec3(1.0, 0.02, 0.06) * ghost * p * 1.2;                       // fantasma vermelho
    outc = clamp(outc, 0.0, 1.0);
  }

  // Fantasma Azul (JRPG melanc\xF3lico, ex. Persona 3): contornos azuis (edge) + eco azul + duotone frio.
  if (uPersonaBlue > 0.001) {
    float p = uPersonaBlue;
    float lC = luma(srcColor);
    float lU = luma(texture2D(uTex, sampleUv(uv + vec2(0.0,  uTexel.y * 1.5))).rgb);
    float lD = luma(texture2D(uTex, sampleUv(uv + vec2(0.0, -uTexel.y * 1.5))).rgb);
    float lL = luma(texture2D(uTex, sampleUv(uv + vec2(-uTexel.x * 1.5, 0.0))).rgb);
    float lR = luma(texture2D(uTex, sampleUv(uv + vec2( uTexel.x * 1.5, 0.0))).rgb);
    float edge = clamp((abs(lU - lD) + abs(lL - lR)) * 2.6, 0.0, 1.0);     // contorno
    vec2 off = vec2(-0.02, 0.014) * p;
    float le = luma(texture2D(uTex, sampleUv(uv + off)).rgb);
    float ghost = clamp((le - lC) * 1.5 + abs(le - lC) * 0.6, 0.0, 1.0);
    float lq = luma(outc);
    vec3 duo = mix(vec3(0.01, 0.02, 0.06), vec3(0.5, 0.72, 1.0), smoothstep(0.15, 0.85, lq));
    outc = mix(outc, duo, p * 0.5);                                        // azul melanc\xF3lico
    outc += vec3(0.15, 0.45, 1.0) * edge * p * 1.1;                        // contornos azuis
    outc += vec3(0.10, 0.35, 0.95) * ghost * p * 0.7;                      // fantasma azul
    outc = clamp(outc, 0.0, 1.0);
  }

  // Vigilante Noir (clima "The Batman"): duotone vermelho/\xE2mbar, pretos profundos, vinheta densa.
  if (uDarkKnight > 0.001) {
    float p = uDarkKnight;
    float lq = luma(outc);
    vec3 duo = mix(vec3(0.02, 0.006, 0.0),
                   mix(vec3(0.45, 0.10, 0.05), vec3(1.0, 0.55, 0.30), smoothstep(0.6, 1.0, lq)),
                   smoothstep(0.0, 0.85, lq));
    vec3 look = mix(vec3(lq), duo, 0.92);                                  // dessatura p/ duotone
    look = (look - 0.5) * 1.22 + 0.5;                                      // contraste
    look -= (1.0 - smoothstep(0.0, 0.4, lq)) * 0.18;                       // afunda sombras
    look += vec3(0.22, 0.04, 0.0) * smoothstep(0.72, 1.0, lq);            // brilho vermelho nas luzes
    outc = mix(outc, clamp(look, 0.0, 1.0), p);
    outc *= 1.0 - smoothstep(0.42, 1.0, edist) * p * 0.7;                  // vinheta
  }

  // Cyber Neon (Cyberpunk): aberra\xE7\xE3o crom\xE1tica, split-tone ciano/magenta e satura\xE7\xE3o neon.
  if (uCyberNeon > 0.001) {
    float p = uCyberNeon;
    float ab = p * 0.006;
    float rC = texture2D(uTex, sampleUv(uv + vec2(ab, 0.0))).r;
    float bC = texture2D(uTex, sampleUv(uv - vec2(ab, 0.0))).b;
    outc += vec3(rC - srcColor.r, 0.0, bC - srcColor.b) * p;               // aberra\xE7\xE3o crom\xE1tica
    float lq = luma(outc);
    outc += vec3(-0.05, 0.03, 0.12) * (1.0 - smoothstep(0.0, 0.5, lq)) * p; // sombras ciano
    outc += vec3(0.14, -0.02, 0.10) * smoothstep(0.5, 1.0, lq) * p;        // luzes magenta
    outc = mix(vec3(lq), outc, 1.0 + p * 0.6);                             // satura
    outc = clamp(outc, 0.0, 1.0);
  }

  // Cel-Shade (quadrinho/cartoon): cor posterizada + contornos de tinta preta.
  if (uInkToon > 0.001) {
    float p = uInkToon;
    float lC = luma(srcColor);
    float lU = luma(texture2D(uTex, sampleUv(uv + vec2(0.0, uTexel.y * 1.5))).rgb);
    float lL = luma(texture2D(uTex, sampleUv(uv + vec2(uTexel.x * 1.5, 0.0))).rgb);
    float edge = clamp((abs(lU - lC) + abs(lL - lC)) * 5.0, 0.0, 1.0);     // contorno tinta
    vec3 poster = floor(outc * 4.0 + 0.5) / 4.0;                           // quantiza cor
    outc = mix(outc, poster, p * 0.85);
    outc = mix(outc, vec3(0.02), edge * p);                               // tinta preta nos contornos
    outc = clamp(outc, 0.0, 1.0);
  }

  // N\xE9voa Sombria (survival horror): dessatura, escurece, n\xE9voa das bordas e gr\xE3o pesado.
  if (uDreadFog > 0.001) {
    float p = uDreadFog;
    float lq = luma(outc);
    vec3 fog = mix(outc, vec3(lq), 0.7);                                   // dessatura
    fog *= 0.72;                                                           // escurece
    fog = (fog - 0.5) * 1.1 + 0.5;                                         // contraste
    float fv = smoothstep(0.2, 1.0, edist);                               // n\xE9voa cresce das bordas
    fog = mix(fog, vec3(0.32, 0.34, 0.31), fv * 0.5);                      // n\xE9voa cinza-esverdeada
    fog += (rand(uv * uReferenceWidth * 0.6 + uSeed) - 0.5) * 0.18;        // gr\xE3o pesado
    outc = mix(outc, clamp(fog, 0.0, 1.0), p);
  }

  // ===== Sess\xE3o Leak (vazamentos de luz, todos em mistura screen) =====

  // Light Leak quente: vazamento de luz vindo dos cantos.
  if (uLightLeak > 0.001) {
    float p = uLightLeak;
    float l1 = smoothstep(0.95, 0.1, distance(uv, vec2(1.06, 1.06)));      // canto sup-direito
    float l2 = smoothstep(0.75, 0.1, distance(uv, vec2(-0.06, -0.06)));    // canto inf-esquerdo
    vec3 leak = vec3(1.0, 0.55, 0.2) * l1 + vec3(1.0, 0.32, 0.42) * l2 * 0.7;
    outc = 1.0 - (1.0 - outc) * (1.0 - clamp(leak * p, 0.0, 1.0));         // screen
    outc = clamp(outc, 0.0, 1.0);
  }

  // Risco Diagonal: faixa dourada quente cruzando o quadro na diagonal.
  if (uLeakStreak > 0.001) {
    float p = uLeakStreak;
    float d = (uv.x + uv.y) * 0.5;                                         // posi\xE7\xE3o ao longo da diagonal
    float band = exp(-pow((d - 0.62) * 5.0, 2.0));                         // banda gaussiana suave
    band += exp(-pow((d - 0.40) * 12.0, 2.0)) * 0.4;                       // risco secund\xE1rio fino
    vec3 streak = vec3(1.0, 0.72, 0.32) * band;                           // dourado-quente
    outc = 1.0 - (1.0 - outc) * (1.0 - clamp(streak * p, 0.0, 1.0));
    outc = clamp(outc, 0.0, 1.0);
  }

  // Arco-\xEDris Prisma: banda de dispers\xE3o com matiz variando ao longo dela.
  if (uLeakRainbow > 0.001) {
    float p = uLeakRainbow;
    float d = uv.x - uv.y;                                                 // coordenada diagonal
    float band = exp(-pow((d - 0.05) * 2.6, 2.0));                         // largura da banda
    vec3 rainbow = hsl2rgb(vec3(fract(d * 0.5 + 0.6), 0.9, 0.6));         // espectro
    outc = 1.0 - (1.0 - outc) * (1.0 - clamp(rainbow * band * p, 0.0, 1.0));
    outc = clamp(outc, 0.0, 1.0);
  }

  // Fim de Rolo: faixa vermelha/laranja intensa numa borda (queima de fim de filme).
  if (uLeakEdge > 0.001) {
    float p = uLeakEdge;
    float edge = smoothstep(0.55, 1.02, uv.x);                            // cresce para a direita
    edge *= 0.82 + 0.18 * sin(uv.y * 13.0 + uSeed);                       // ondula\xE7\xE3o irregular
    vec3 burn = mix(vec3(1.0, 0.45, 0.1), vec3(1.0, 0.12, 0.04), smoothstep(0.7, 1.0, uv.x));
    outc = 1.0 - (1.0 - outc) * (1.0 - clamp(burn * edge * p, 0.0, 1.0));
    outc = clamp(outc, 0.0, 1.0);
  }

  // Reflexo de Lente: orbe/hotspot dourado suave com halo secund\xE1rio.
  if (uLeakSpot > 0.001) {
    float p = uLeakSpot;
    float d = distance(uv, vec2(0.72, 0.30));                             // posi\xE7\xE3o do orbe
    float orb = exp(-pow(d * 4.0, 2.0));                                   // brilho central
    orb += exp(-pow((d - 0.18) * 16.0, 2.0)) * 0.4;                        // halo
    vec3 flare = vec3(1.0, 0.85, 0.5) * orb;
    outc = 1.0 - (1.0 - outc) * (1.0 - clamp(flare * p, 0.0, 1.0));
    outc = clamp(outc, 0.0, 1.0);
  }

  // ===== Extras de Filme & Gr\xE3o =====

  // Brilho Difuso (pro-mist): glow suave e sonhador espalhando as altas luzes + leve haze.
  if (uFilmBloom > 0.001) {
    float p = uFilmBloom;
    vec3 bloom = texture2D(uTex, sampleUv(uv + vec2( 0.010, 0.0))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(-0.010, 0.0))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(0.0,  0.010))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(0.0, -0.010))).rgb
               + texture2D(uTex, sampleUv(uv + vec2( 0.016,  0.016))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(-0.016,  0.016))).rgb
               + texture2D(uTex, sampleUv(uv + vec2( 0.016, -0.016))).rgb
               + texture2D(uTex, sampleUv(uv + vec2(-0.016, -0.016))).rgb;
    bloom *= 0.125;
    float hl = smoothstep(0.4, 1.0, luma(bloom));
    outc = 1.0 - (1.0 - outc) * (1.0 - bloom * hl * p * 0.9);              // screen nos brilhos
    outc = mix(outc, outc * 0.92 + 0.08, p * 0.4);                         // leve haze (lift dos pretos)
    outc = clamp(outc, 0.0, 1.0);
  }

  // Flare Anam\xF3rfico: risco horizontal azul saindo das altas luzes (cinematogr\xE1fico).
  if (uAnamorphic > 0.001) {
    float p = uAnamorphic;
    vec3 streak = vec3(0.0);
    for (int i = 1; i <= 6; i++) {
      float d = float(i) * 0.012;
      streak += texture2D(uTex, sampleUv(uv + vec2(d, 0.0))).rgb * (1.0 - float(i) / 7.0);
      streak += texture2D(uTex, sampleUv(uv - vec2(d, 0.0))).rgb * (1.0 - float(i) / 7.0);
    }
    streak /= 8.0;
    float hl = smoothstep(0.6, 1.0, luma(streak));
    outc += vec3(0.2, 0.4, 1.0) * hl * p * 1.2;                            // flare azul horizontal
    outc = clamp(outc, 0.0, 1.0);
  }

  // ===== Efeitos de cor adicionais =====

  // Pixel Art: pixeliza (grade) + reduz a paleta, estilo console retr\xF4.
  if (uPixelArt > 0.001) {
    float p = uPixelArt;
    float cells = mix(220.0, 60.0, p);                                     // menos c\xE9lulas = mais pixelado
    vec2 snapped = (floor(uv * cells) + 0.5) / cells;
    vec3 px = texture2D(uTex, sampleUv(snapped)).rgb;
    px = floor(px * 6.0 + 0.5) / 6.0;                                      // posteriza a paleta
    outc = mix(outc, clamp(px, 0.0, 1.0), p);
  }

  // LCD Verde: pixeliza grosso e mapeia a lumin\xE2ncia para 4 tons verdes (port\xE1til cl\xE1ssico).
  if (uGameboy > 0.001) {
    float p = uGameboy;
    float cells = mix(200.0, 84.0, p);
    vec2 snapped = (floor(uv * cells) + 0.5) / cells;
    float lp = luma(texture2D(uTex, sampleUv(snapped)).rgb);
    float q = clamp(floor(lp * 4.0) / 3.0, 0.0, 1.0);                      // 4 n\xEDveis
    vec3 gb = mix(vec3(0.06, 0.22, 0.06), vec3(0.61, 0.74, 0.06), q);      // paleta verde DMG
    outc = mix(outc, gb, p);
  }

  // Vis\xE3o T\xE9rmica: mapa de calor infravermelho a partir da lumin\xE2ncia (frio \u2192 quente).
  if (uThermal > 0.001) {
    float p = uThermal;
    float l = luma(srcColor);
    vec3 heat = vec3(0.0, 0.0, 0.5) * smoothstep(0.0, 0.3, l);             // azul escuro
    heat = mix(heat, vec3(0.6, 0.0, 0.7), smoothstep(0.2, 0.45, l));       // roxo
    heat = mix(heat, vec3(1.0, 0.1, 0.0), smoothstep(0.4, 0.65, l));       // vermelho
    heat = mix(heat, vec3(1.0, 0.8, 0.0), smoothstep(0.6, 0.85, l));       // amarelo
    heat = mix(heat, vec3(1.0, 1.0, 1.0), smoothstep(0.85, 1.0, l));       // branco quente
    outc = mix(outc, clamp(heat, 0.0, 1.0), p);
  }

  // Vaporwave: duotone rosa/ciano synthwave + gradiente de c\xE9u + scanlines (estilo Outrun).
  if (uVaporwave > 0.001) {
    float p = uVaporwave;
    float l = luma(outc);
    vec3 grad = mix(vec3(0.25, 0.0, 0.5), vec3(1.0, 0.2, 0.6), smoothstep(0.0, 0.6, l)); // sombras roxas \u2192 rosa
    grad = mix(grad, vec3(0.2, 0.9, 1.0), smoothstep(0.6, 1.0, l));        // luzes ciano
    grad += mix(vec3(0.15, 0.0, 0.2), vec3(0.0, 0.1, 0.15), uv.y) * 0.3;   // gradiente de c\xE9u
    outc = mix(outc, clamp(grad, 0.0, 1.0), p * 0.85);
    outc *= 1.0 - p * 0.12 * (0.5 + 0.5 * sin(uv.y * 300.0 * 3.14159265)); // scanlines suaves
    outc = clamp(outc, 0.0, 1.0);
  }

  gl_FragColor = vec4(clamp(outc, 0.0, 1.0), 1.0);
}
`;var na=["red","orange","yellow","green","aqua","blue","purple","magenta"];var Lr={hue:0,saturation:0,luminance:0},Ze={hue:0,saturation:0,luminance:0},Ro={shadows:{...Lr},midtones:{...Lr},highlights:{...Lr},global:{...Lr}},Go={red:{...Ze},orange:{...Ze},yellow:{...Ze},green:{...Ze},aqua:{...Ze},blue:{...Ze},purple:{...Ze},magenta:{...Ze}},Cr=()=>[{x:0,y:0},{x:1,y:1}],Fo={highlights:0,lights:0,darks:0,shadows:0},Do={rgb:Cr(),red:Cr(),green:Cr(),blue:Cr(),parametric:{...Fo}},Oo={exposure:0,brilliance:0,highlights:0,shadows:0,contrast:0,brightness:0,blackPoint:0,saturation:0,vibrance:0,temperature:0,tint:0,bwIntensity:0,tonalSeparation:0,blackDepth:0,whiteBoost:0,fade:0,noirCurve:"classic",clarity:0,texture:0,sharpness:0,definition:0,noiseReduction:0,grain:0,grainSize:3,grainRoughness:30,isoSimulation:"100",grainType:"film35mm",vignette:0,vignetteSoftness:50,vignetteIntensity:50,vignetteCenterX:.5,vignetteCenterY:.5,distortion:0,colorGrading:{shadows:{...Lr},midtones:{...Lr},highlights:{...Lr},global:{...Lr}},hslMixer:{red:{...Ze},orange:{...Ze},yellow:{...Ze},green:{...Ze},aqua:{...Ze},blue:{...Ze},purple:{...Ze},magenta:{...Ze}},toneCurves:{rgb:Cr(),red:Cr(),green:Cr(),blue:Cr(),parametric:{...Fo}}};var ia={crt:0,burn:0,worn:0,halation:0,vhs:0,signalLoss:0,interference:0,scanlines:0,filmGrain:0,darkGrainy:0,concrete:0,grunge:0,glitch:0,dustVintage:0,lightLeak:0,leakStreak:0,leakRainbow:0,leakEdge:0,leakSpot:0,filmBloom:0,anamorphic:0,personaRed:0,personaBlue:0,darkKnight:0,cyberNeon:0,inkToon:0,dreadFog:0,pixelArt:0,gameboy:0,thermal:0,vaporwave:0,fisheye:0,antiFisheye:0},Io={aspectRatio:"original",rotation:0,straighten:0,perspectiveVertical:0,perspectiveHorizontal:0,flipHorizontal:!1,flipVertical:!1,rect:{x:0,y:0,width:1,height:1}};function ca(G){return G<0?0:G>1?1:G}function oa(G){let J=[...G].map(de=>({x:ca(de.x),y:ca(de.y)})).sort((de,$e)=>de.x-$e.x),fe=[],Ce=[];for(let de of J)fe.length&&de.x-fe[fe.length-1]<1e-6||(fe.push(de.x),Ce.push(de.y));let le=new Float64Array(256),ce=fe.length;if(ce===0){for(let de=0;de<256;de++)le[de]=de/255;return le}if(ce===1)return le.fill(Ce[0]),le;let pe=[],Se=[];for(let de=0;de<ce-1;de++)pe[de]=fe[de+1]-fe[de],Se[de]=(Ce[de+1]-Ce[de])/pe[de];let re=new Array(ce);re[0]=Se[0],re[ce-1]=Se[ce-2];for(let de=1;de<ce-1;de++)if(Se[de-1]*Se[de]<=0)re[de]=0;else{let $e=2*pe[de]+pe[de-1],Me=pe[de]+2*pe[de-1];re[de]=($e+Me)/($e/Se[de-1]+Me/Se[de])}for(let de=0;de<256;de++){let $e=de/255;if($e<=fe[0]){le[de]=Ce[0];continue}if($e>=fe[ce-1]){le[de]=Ce[ce-1];continue}let Me=0;for(;Me<ce-1&&$e>fe[Me+1];)Me++;let je=($e-fe[Me])/pe[Me],gr=je*je,Vr=gr*je,_r=2*Vr-3*gr+1,nt=Vr-2*gr+je,Tt=-2*Vr+3*gr,At=Vr-gr;le[de]=ca(_r*Ce[Me]+nt*pe[Me]*re[Me]+Tt*Ce[Me+1]+At*pe[Me]*re[Me+1])}return le}var Bo={highlights:0,lights:0,darks:0,shadows:0},ua={shadows:.1,darks:.36,lights:.64,highlights:.9},ko=.18,sa=.2;function fa(G,J){let fe=G-J;return Math.exp(-(fe*fe)/(2*ko*ko))}function kl(G){let J=G.shadows/100,fe=G.darks/100,Ce=G.lights/100,le=G.highlights/100,ce=new Float64Array(256);for(let pe=0;pe<256;pe++){let Se=pe/255,re=Se;re+=J*fa(Se,ua.shadows)*sa,re+=fe*fa(Se,ua.darks)*sa,re+=Ce*fa(Se,ua.lights)*sa,re+=le*fa(Se,ua.highlights)*sa,ce[pe]=ca(re)}return ce}function Bl(G){return G.highlights===0&&G.lights===0&&G.darks===0&&G.shadows===0}function No(G){let J=oa(G.rgb),fe=kl(G.parametric??Bo),Ce=new Float64Array(256);for(let re=0;re<256;re++){let de=Math.round(fe[re]*255);Ce[re]=J[de]}let le=oa(G.red),ce=oa(G.green),pe=oa(G.blue),Se=new Uint8Array(256*4);for(let re=0;re<256;re++)Se[re*4+0]=Math.round(le[re]*255),Se[re*4+1]=Math.round(ce[re]*255),Se[re*4+2]=Math.round(pe[re]*255),Se[re*4+3]=Math.round(Ce[re]*255);return Se}function la(G){return G.every(J=>Math.abs(J.y-J.x)<1e-4)}function Po(G){return Bl(G.parametric??Bo)&&la(G.rgb)&&la(G.red)&&la(G.green)&&la(G.blue)}function Nl(G,J,fe){if(J===0)return[fe,fe,fe];let Ce=(pe,Se,re)=>(re<0&&(re+=1),re>1&&(re-=1),re<1/6?pe+(Se-pe)*6*re:re<1/2?Se:re<2/3?pe+(Se-pe)*(2/3-re)*6:pe),le=fe<.5?fe*(1+J):fe+J-fe*J,ce=2*fe-le;return[Ce(ce,le,G+1/3),Ce(ce,le,G),Ce(ce,le,G-1/3)]}function ma(G){let J=Math.max(0,Math.min(1,G.saturation/100));if(J===0)return[0,0,0];let fe=(G.hue%360+360)%360/360,[Ce,le,ce]=Nl(fe,1,.5);return[(Ce-.5)*J,(le-.5)*J,(ce-.5)*J]}var Pl={soft:0,classic:1,high_contrast:2,cinematic:3,vintage:4},Ml={100:0,200:.12,400:.28,800:.5,1600:.75,3200:1},Ul={digital:0,film35mm:1,old_film:2,newspaper_noir:3,cinematic:4},Vl={high_contrast_bw:1,silver_tones:2,vintage:3,mono:4,tonal:5,noir:6,silvertone:7,newspaper_noir:8,fuji_provia:9,fuji_velvia:10,fuji_astia:11,fuji_classic_chrome:12,fuji_classic_neg:13,fuji_eterna:14,fuji_nostalgic_neg:15,fuji_acros:16,cine_teal_orange:17,cine_bleach_bypass:18,cine_day_for_night:19,cine_thriller:20,cine_golden:21,aes_pastel:22,aes_faded_matte:23,aes_moody:24,aes_clean:25,aes_warm_peach:26,vint_seventies:27,vint_polaroid:28,vint_sepia:29,vint_kodachrome:30,vint_cross_process:31,nost_faded_90s:32,nost_washed_film:33,nost_disposable:34,nost_muted_vsco:35,nost_sun_faded:36,edit_porcelain:37,edit_satin:38,edit_graphite:39,edit_champagne:40,lab_cyanotype:41,lab_selenium:42,lab_lith:43,lab_solarized:44};function Mo(G,J,fe,Ce,le,ce){let pe=je=>je/100,Se=le?.rect??{x:0,y:0,width:1,height:1},re={...ia,...ce},de=G.colorGrading??Ro,$e=G.hslMixer??Go,Me=G.toneCurves??Do;return{uCurveOn:Po(Me)?0:1,curveLUT:No(Me),uCrt:re.crt/100,uBurn:re.burn/100,uWorn:re.worn/100,uHalation:re.halation/100,uVhs:re.vhs/100,uSignalLoss:re.signalLoss/100,uInterference:re.interference/100,uScanlines:re.scanlines/100,uFilmGrain:re.filmGrain/100,uDarkGrainy:re.darkGrainy/100,uConcrete:re.concrete/100,uGrunge:re.grunge/100,uGlitch:re.glitch/100,uDustVintage:re.dustVintage/100,uLightLeak:re.lightLeak/100,uLeakStreak:re.leakStreak/100,uLeakRainbow:re.leakRainbow/100,uLeakEdge:re.leakEdge/100,uLeakSpot:re.leakSpot/100,uFilmBloom:re.filmBloom/100,uAnamorphic:re.anamorphic/100,uPersonaRed:re.personaRed/100,uPersonaBlue:re.personaBlue/100,uDarkKnight:re.darkKnight/100,uCyberNeon:re.cyberNeon/100,uInkToon:re.inkToon/100,uDreadFog:re.dreadFog/100,uPixelArt:re.pixelArt/100,uGameboy:re.gameboy/100,uThermal:re.thermal/100,uVaporwave:re.vaporwave/100,uFisheye:re.fisheye/100,uAntiFisheye:re.antiFisheye/100,uCropRect:[Se.x,Se.y,Se.width,Se.height],uFlipX:le?.flipHorizontal?1:0,uFlipY:le?.flipVertical?1:0,uRotate90:le?Math.round(le.rotation%360/90):0,uStraighten:le?le.straighten*Math.PI/180:0,uExposure:pe(G.exposure),uContrast:pe(G.contrast),uHighlights:pe(G.highlights),uShadows:pe(G.shadows),uBrightness:pe(G.brightness),uBlackPoint:pe(G.blackPoint),uBrilliance:pe(G.brilliance),uSaturation:pe(G.saturation),uVibrance:pe(G.vibrance),uTemperature:pe(G.temperature),uTint:pe(G.tint),uBwIntensity:G.bwIntensity/100,uTonalSeparation:pe(G.tonalSeparation),uBlackDepth:pe(G.blackDepth),uWhiteBoost:pe(G.whiteBoost),uFade:G.fade/100,uNoirCurve:Pl[G.noirCurve]??1,uClarity:pe(G.clarity),uTexture:pe(G.texture),uSharpness:G.sharpness/100,uDefinition:G.definition/100,uNoiseReduction:G.noiseReduction/100,uGrain:G.grain/100,uGrainSize:G.grainSize,uGrainRoughness:G.grainRoughness/100,uIso:Ml[G.isoSimulation]??0,uGrainType:Ul[G.grainType]??1,uReferenceWidth:fe,uSeed:Ce,uVignette:pe(G.vignette),uVignetteSoftness:G.vignetteSoftness/100,uVignetteIntensity:G.vignetteIntensity/100,uVignetteCenter:[G.vignetteCenterX,G.vignetteCenterY],uFilter:J?.name?Vl[J.name]??0:0,uFilterIntensity:J?.name?J.intensity/100:0,uCgShadows:ma(de.shadows),uCgMidtones:ma(de.midtones),uCgHighlights:ma(de.highlights),uCgGlobal:ma(de.global),uCgShadowsLum:de.shadows.luminance/100,uCgMidtonesLum:de.midtones.luminance/100,uCgHighlightsLum:de.highlights.luminance/100,uCgGlobalLum:de.global.luminance/100,uHslHue:na.map(je=>$e[je].hue/100),uHslSat:na.map(je=>$e[je].saturation/100),uHslLum:na.map(je=>$e[je].luminance/100)}}var Uo=["uExposure","uContrast","uHighlights","uShadows","uBrightness","uBlackPoint","uBrilliance","uSaturation","uVibrance","uTemperature","uTint","uBwIntensity","uTonalSeparation","uBlackDepth","uWhiteBoost","uFade","uNoirCurve","uCurveOn","uClarity","uTexture","uSharpness","uDefinition","uNoiseReduction","uGrain","uGrainSize","uGrainRoughness","uIso","uGrainType","uReferenceWidth","uSeed","uVignette","uVignetteSoftness","uVignetteIntensity","uVignetteCenter","uFilter","uFilterIntensity","uCropRect","uFlipX","uFlipY","uRotate90","uStraighten","uCrt","uBurn","uWorn","uHalation","uVhs","uFilmGrain","uDarkGrainy","uConcrete","uGrunge","uGlitch","uDustVintage","uSignalLoss","uInterference","uScanlines","uLightLeak","uLeakStreak","uLeakRainbow","uLeakEdge","uLeakSpot","uFilmBloom","uAnamorphic","uPersonaRed","uPersonaBlue","uDarkKnight","uCyberNeon","uInkToon","uDreadFog","uPixelArt","uGameboy","uThermal","uVaporwave","uFisheye","uAntiFisheye","uCgShadows","uCgMidtones","uCgHighlights","uCgGlobal","uCgShadowsLum","uCgMidtonesLum","uCgHighlightsLum","uCgGlobalLum","uHslHue","uHslSat","uHslLum"];var pn=class{constructor(){at(this,"regl");at(this,"draw");at(this,"glCanvas");at(this,"textures",new Map);at(this,"lutTex");this.glCanvas=document.createElement("canvas"),this.glCanvas.width=16,this.glCanvas.height=16,this.regl=(0,Vo.default)({canvas:this.glCanvas,attributes:{preserveDrawingBuffer:!0,premultipliedAlpha:!1}});let J={uHslHue:8,uHslSat:8,uHslLum:8},fe={uTex:this.regl.prop("uTex"),uTexel:this.regl.prop("uTexel"),uCurveLUT:this.regl.prop("uCurveLUT")};for(let le of Uo){let ce=J[le];if(ce)for(let pe=0;pe<ce;pe++)fe[`${le}[${pe}]`]=(Se,re)=>re[le][pe];else fe[le]=this.regl.prop(le)}let Ce=new Uint8Array(256*4);for(let le=0;le<256;le++){let ce=le*4;Ce[ce]=Ce[ce+1]=Ce[ce+2]=Ce[ce+3]=le}this.lutTex=this.regl.texture({width:256,height:1,format:"rgba",data:Ce,min:"linear",mag:"linear",wrap:"clamp"}),this.draw=this.regl({frag:wo,vert:Co,attributes:{position:[-1,-1,3,-1,-1,3]},uniforms:fe,count:3})}getTexture(J,fe){let Ce=this.textures.get(J);if(Ce)return Ce.tex;let le=this.regl.texture({data:fe,flipY:!0,min:"linear",mag:"linear"});return this.textures.set(J,{tex:le,w:fe.naturalWidth,h:fe.naturalHeight}),le}releaseTexture(J){let fe=this.textures.get(J);fe&&(fe.tex.destroy(),this.textures.delete(J))}process(J,fe,Ce,le,ce,pe){let Se=Math.max(1,Math.round(ce)),re=Math.max(1,Math.round(pe));(this.glCanvas.width!==Se||this.glCanvas.height!==re)&&(this.glCanvas.width=Se,this.glCanvas.height=re),this.regl.poll();let de=this.getTexture(J,fe),{curveLUT:$e,...Me}=Ce;$e instanceof Uint8Array&&this.lutTex({width:256,height:1,format:"rgba",data:$e}),this.regl.clear({color:[0,0,0,1],depth:1}),this.draw({uTex:de,uTexel:[1/Se,1/re],uCurveLUT:this.lutTex,...Me}),le.width!==Se&&(le.width=Se),le.height!==re&&(le.height=re);let je=le.getContext("2d");je.clearRect(0,0,Se,re),je.drawImage(this.glCanvas,0,0)}},hn=null;function zo(){return hn||(hn=new pn),hn}function dc(G,J,fe=80,Ce=!1){let ce=Math.min(1,1400/Math.max(G.naturalWidth,G.naturalHeight)),pe=document.createElement("canvas"),Se=structuredClone(Oo),re={...ia,filmGrain:Ce?20:0},de=Mo(Se,{name:J,intensity:fe},1080,42,Io,re);return zo().process(G.src,G,de,pe,G.naturalWidth*ce,G.naturalHeight*ce),pe}export{dc as renderPhoto};

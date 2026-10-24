> **AI INSTRUCTION:** 
> The text below contains the main SOURCE CODE files of the mdblog application.
> Each file starts with a title indicating its exact relative path (e.g., `## File: src/main.ts`).
> Whenever suggesting changes, clearly indicate which file should be modified based on these paths and provide the complete new code for the file.

---

# Exported Context from Project mdBlog [v0.2.3#mvmwaqyg] - Mode: MDBLOG

Automatically generated at: 2026-10-24T21:39:28.535Z

---

## File: `packages/mdblog/README.md`

````md
# @vanaware/mdblog

> Browser Blog and Documentation Engine from Markdown using Service Worker, Wire Format AST, and Preact Islands.

[![JSR](https://jsr.io/badges/@vanaware/mdblog)](https://jsr.io/@vanaware/mdblog)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

`@vanaware/mdblog` is an offline-capable, zero-build Markdown blog and documentation library. It parses CommonMark + GFM directly into a secure, JSON-serializable **Wire Format AST**, which is rendered into virtual DOM components with interactive **HTML+ES Islands**.

---

## 📦 Installation

Add `@vanaware/mdblog` to your Deno project via JSR:

```bash
deno add jsr:@vanaware/mdblog
```

Or with npm/yarn/pnpm:

```bash
npx jsr add @vanaware/mdblog
```

---

## 🚀 Usage

### 1. Programmatic Markdown to Wire AST

Parse Markdown strings and generate lightweight, XSS-safe Wire Format JSON trees:

```typescript
import {
  parseMarkdown,
  mdastToWire,
  processMarkdown,
} from "@vanaware/mdblog";

const markdown = `---
title: "Release Notes"
author: "Vanaware"
---
# Version 1.0

- [x] Service Worker offline cache
- [x] GFM tables and checklists
- [ ] Next features

::Counter.js{start: 10}
`;

// 1. High-level single call (extracts frontmatter + AST)
const doc = processMarkdown(markdown, "/articles/release-notes.md");
console.log(doc.title); // "Release Notes"
console.log(doc.wire);  // JSON-serializable WireFragment

// 2. Low-level modular pipeline
const mdast = parseMarkdown(markdown);
const { wire, title } = mdastToWire(mdast);
```

### 2. Service Worker Interceptor (PWA)

In your Service Worker (`sw.js`), intercept markdown routes and respond with Wire AST JSON or pre-rendered HTML shells:

```typescript
/// <reference lib="webworker" />
import mdTranspiler, { createBrowserIO, createSWFetchHandler } from "@vanaware/mdblog";

const io = createBrowserIO({
  cacheName: "my-docs-cache-v1",
  useIndexedDB: true,
});

const handleDocFetch = createSWFetchHandler(io, {
  basePath: "./articles",
  cacheTTLSeconds: 60,
  bundlePath: "./mdblog.js",
});

self.addEventListener("fetch", (event: FetchEvent) => {
  // Automatically serves .md files as WireDoc JSON or HTML shell
  if (handleDocFetch(event)) {
    return;
  }
});
```

### 3. Rendering Wire AST to Preact VNodes

```typescript
import { wireToVNode, hydrateIslands } from "@vanaware/mdblog";
import { render } from "preact";

// Materialize Wire AST without dangerouslySetInnerHTML
const vnodes = wireToVNode(doc.wire);
render(vnodes, document.getElementById("content")!);

// Selectively hydrate any dynamic islands rendered on page
await hydrateIslands();
```

---

## 🏝️ Dynamic Islands (Zero Bundle)

Create interactive widgets in `public/islands/MyWidget.js` using pure HTML+ES:

```javascript
// public/islands/MyWidget.js
import { html, signal, useSignal } from "../mdblog.js";

export function MyWidget({ start = 0 }) {
  const count = useSignal(Number(start));

  return html`
    <button class="chip primary" onClick=${() => count.value++}>
      Clicks: ${count.value}
    </button>
  `;
}

export default MyWidget;
```

Embed it anywhere in Markdown:

```markdown
::MyWidget.js{start: 42}
```

---

## 🧩 Public API Summary

- **Components:** `App`, `Navbar`, `Sidebar`, `Content`, `ThemeToggle`, `SearchBox`
- **Pipeline:** `parseMarkdown`, `mdastToWire`, `processMarkdown`, `loadDoc`, `defaultShell`
- **I/O & Adapters:** `createBrowserIO`, `createMemoryIO`, `createSWFetchHandler`, `createLocalFetcher`, `mdFetch`
- **Islands & Rendering:** `wireToVNode`, `hydrateIslands`, `defaultRegistry`, `dynamicIslandsCache`
- **Reactive State:** `html`, `signal`, `useSignal`, `computed`, `effect`, `batch`, `state`
- **Utilities:** `slugify`, `isSWControlling`, `resolveDocPath`, `countWireNodes`, `countWireIslands`, `sanitizeProps`

See [docs/api-reference.md](../../docs/api-reference.md) for full signatures and options.

---

## 📄 License

MIT © [Vanaware](https://github.com/vanaware)

````

---

## File: `packages/mdblog/deno.jsonc`

```json
{
  "name": "@vanaware/mdblog",
  "version": "0.2.3#mvmwaqyg",
  "description": "Browser Blog engine from markdown.",
  "author": "Vanaware",
  "license": "MIT",
  "compilerOptions": {
    "lib": ["deno.window", "dom", "dom.iterable"]
  },
  "imports": {
    "@std/assert": "jsr:@std/assert@^1.0.19",
    "@std/path": "jsr:@std/path@^1.1.6",
    "@std/testing": "jsr:@std/testing@^1.0.20",
    "preact": "npm:preact@10.25.4",
    "preact/hooks": "npm:preact@10.25.4/hooks",
    "@preact/signals": "npm:@preact/signals@2.0.1",
    "htm/preact": "npm:htm@^3.1.1/preact",
    "idb-keyval": "npm:idb-keyval@^6.2.1",
    "mdast-util-from-markdown": "npm:mdast-util-from-markdown@^2.0.2",
    "mdast-util-gfm": "npm:mdast-util-gfm@^3.1.0",
    "micromark-extension-gfm": "npm:micromark-extension-gfm@^3.0.0"
  },
  "tasks": {
    "test": "deno test -P",
    "lint": "deno lint",
    "fmt": "deno fmt",
    "check": "deno check src/**/*.{ts,tsx} tests/**/*.ts",
    "fmt:check": "deno fmt --check",
    "lint:fix": "deno lint --fix",
    "lint:doc": "deno doc --lint src/mod.ts",
    "tests": "deno task check && deno task lint && deno task fmt:check && deno task test"
  },
  "exports": {
    ".": "./src/mod.ts"
  },
  "publish": {
    "include": [
      "src/**/*.ts",
      "README.md",
      "docs/**/*.md",
      "dist/mdblog.min.js",
      "dist/mdblog.min.js.map",
      "deno.jsonc",
      "public"
    ],
    "exclude": [
      "tests"
    ]
  },
  "lint": {
    "rules": {
      "tags": ["recommended"],
      "include": ["ban-untagged-todo"],
      "exclude": ["no-unused-vars"]
    },
    "include": [
      "src/**/*.{ts,tsx}",
      "tests/**/*test.ts"
    ]
  },
  "test": {
    "permissions": {
      "read": true,
      "write": true,
      "net": true,
      "env": true,
      "sys": true,
      "run": true,
      "ffi": true,
      "import": true
    },
    "include": [
      "tests/**/*test.ts"
    ],
    "exclude": [
      "src/**/*.{ts,tsx}"
    ]
  },
  "fmt": {
    "useTabs": false,
    "lineWidth": 80,
    "indentWidth": 2,
    "semiColons": true,
    "singleQuote": false,
    "proseWrap": "preserve",
    "trailingCommas": "always",
    "json.trailingCommas": "never",
    "operatorPosition": "maintain",
    "jsx.bracketPosition": "sameLine",
    "jsx.forceNewLinesSurroundingContent": true,
    "jsx.multiLineParens": "always",
    "newLineKind": "lf",
    "include": [
      "src/**/*.{ts,tsx,js}",
      "tests/**/*test.ts"
    ]
  },
  "exclude": [
    "docs",
    "dist"
  ]
}

```

---

## File: `packages/mdblog/dist/mdblog.min.js`

````js
/*!
 * mdBlog v0.2.3#mvmwaqyg
 * (c) 2026 Vanaware - MIT License
 */

var Ui=Object.defineProperty;var r=(e,t)=>Ui(e,"name",{value:t,configurable:!0});var Wi=(e,t)=>{for(var n in t)Ui(e,n,{get:t[n],enumerable:!0})};var cn,U,Ki,dr,Ze,ji,Ji,fr,Yi,mr,hr,pr,cl,Rt={},Zi=[],ul=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,gr=Array.isArray;function He(e,t){for(var n in t)e[n]=t[n];return e}r(He,"w");function xr(e){e&&e.parentNode&&e.parentNode.removeChild(e)}r(xr,"_");function Y(e,t,n){var i,a,o,l={};for(o in t)o=="key"?i=t[o]:o=="ref"?a=t[o]:l[o]=t[o];if(arguments.length>2&&(l.children=arguments.length>3?cn.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(o in e.defaultProps)l[o]===void 0&&(l[o]=e.defaultProps[o]);return ln(e,l,i,a,null)}r(Y,"g");function ln(e,t,n,i,a){var o={type:e,props:t,key:n,ref:i,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:a??++Ki,__i:-1,__u:0};return a==null&&U.vnode!=null&&U.vnode(o),o}r(ln,"m");function ge(e){return e.children}r(ge,"k");function $e(e,t){this.props=e,this.context=t}r($e,"x");function bt(e,t){if(t==null)return e.__?bt(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?bt(e):null}r(bt,"C");function Xi(e){var t,n;if((e=e.__)!=null&&e.__c!=null){for(e.__e=e.__c.base=null,t=0;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null){e.__e=e.__c.base=n.__e;break}return Xi(e)}}r(Xi,"S");function Vi(e){(!e.__d&&(e.__d=!0)&&Ze.push(e)&&!sn.__r++||ji!==U.debounceRendering)&&((ji=U.debounceRendering)||Ji)(sn)}r(Vi,"M");function sn(){var e,t,n,i,a,o,l,s;for(Ze.sort(fr);e=Ze.shift();)e.__d&&(t=Ze.length,i=void 0,o=(a=(n=e).__v).__e,l=[],s=[],n.__P&&((i=He({},a)).__v=a.__v+1,U.vnode&&U.vnode(i),br(n.__P,i,a,n.__n,n.__P.namespaceURI,32&a.__u?[o]:null,l,o??bt(a),!!(32&a.__u),s),i.__v=a.__v,i.__.__k[i.__i]=i,no(l,i,s),i.__e!=o&&Xi(i)),Ze.length>t&&Ze.sort(fr));sn.__r=0}r(sn,"P");function eo(e,t,n,i,a,o,l,s,c,u,h){var f,d,p,b,E,T,w=i&&i.__k||Zi,S=t.length;for(c=fl(n,t,w,c,S),f=0;f<S;f++)(p=n.__k[f])!=null&&(d=p.__i===-1?Rt:w[p.__i]||Rt,p.__i=f,T=br(e,p,d,a,o,l,s,c,u,h),b=p.__e,p.ref&&d.ref!=p.ref&&(d.ref&&kr(d.ref,null,p),h.push(p.ref,p.__c||b,p)),E==null&&b!=null&&(E=b),4&p.__u||d.__k===p.__k?c=to(p,c,e):typeof p.type=="function"&&T!==void 0?c=T:b&&(c=b.nextSibling),p.__u&=-7);return n.__e=E,c}r(eo,"$");function fl(e,t,n,i,a){var o,l,s,c,u,h=n.length,f=h,d=0;for(e.__k=new Array(a),o=0;o<a;o++)(l=t[o])!=null&&typeof l!="boolean"&&typeof l!="function"?(c=o+d,(l=e.__k[o]=typeof l=="string"||typeof l=="number"||typeof l=="bigint"||l.constructor==String?ln(null,l,null,null,null):gr(l)?ln(ge,{children:l},null,null,null):l.constructor===void 0&&l.__b>0?ln(l.type,l.props,l.key,l.ref?l.ref:null,l.__v):l).__=e,l.__b=e.__b+1,s=null,(u=l.__i=hl(l,n,c,f))!==-1&&(f--,(s=n[u])&&(s.__u|=2)),s==null||s.__v===null?(u==-1&&d--,typeof l.type!="function"&&(l.__u|=4)):u!=c&&(u==c-1?d--:u==c+1?d++:(u>c?d--:d++,l.__u|=4))):e.__k[o]=null;if(f)for(o=0;o<h;o++)(s=n[o])!=null&&(2&s.__u)==0&&(s.__e==i&&(i=bt(s)),ro(s,s));return i}r(fl,"I");function to(e,t,n){var i,a;if(typeof e.type=="function"){for(i=e.__k,a=0;i&&a<i.length;a++)i[a]&&(i[a].__=e,t=to(i[a],t,n));return t}e.__e!=t&&(t&&e.type&&!n.contains(t)&&(t=bt(e)),n.insertBefore(e.__e,t||null),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}r(to,"A");function hl(e,t,n,i){var a,o,l=e.key,s=e.type,c=t[n];if(c===null||c&&l==c.key&&s===c.type&&(2&c.__u)==0)return n;if(i>(c!=null&&(2&c.__u)==0?1:0))for(a=n-1,o=n+1;a>=0||o<t.length;){if(a>=0){if((c=t[a])&&(2&c.__u)==0&&l==c.key&&s===c.type)return a;a--}if(o<t.length){if((c=t[o])&&(2&c.__u)==0&&l==c.key&&s===c.type)return o;o++}}return-1}r(hl,"L");function Gi(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||ul.test(t)?n:n+"px"}r(Gi,"T");function an(e,t,n,i,a){var o;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof i=="string"&&(e.style.cssText=i=""),i)for(t in i)n&&t in n||Gi(e.style,t,"");if(n)for(t in n)i&&n[t]===i[t]||Gi(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")o=t!=(t=t.replace(Yi,"$1")),t=t.toLowerCase()in e||t=="onFocusOut"||t=="onFocusIn"?t.toLowerCase().slice(2):t.slice(2),e.l||(e.l={}),e.l[t+o]=n,n?i?n.u=i.u:(n.u=mr,e.addEventListener(t,o?pr:hr,o)):e.removeEventListener(t,o?pr:hr,o);else{if(a=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}r(an,"F");function Qi(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t.t==null)t.t=mr++;else if(t.t<n.u)return;return n(U.event?U.event(t):t)}}}r(Qi,"O");function br(e,t,n,i,a,o,l,s,c,u){var h,f,d,p,b,E,T,w,S,_,P,$,y,F,N,W,x,z=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(c=!!(32&n.__u),o=[s=t.__e=n.__e]),(h=U.__b)&&h(t);e:if(typeof z=="function")try{if(w=t.props,S="prototype"in z&&z.prototype.render,_=(h=z.contextType)&&i[h.__c],P=h?_?_.props.value:h.__:i,n.__c?T=(f=t.__c=n.__c).__=f.__E:(S?t.__c=f=new z(w,P):(t.__c=f=new $e(w,P),f.constructor=z,f.render=dl),_&&_.sub(f),f.props=w,f.state||(f.state={}),f.context=P,f.__n=i,d=f.__d=!0,f.__h=[],f._sb=[]),S&&f.__s==null&&(f.__s=f.state),S&&z.getDerivedStateFromProps!=null&&(f.__s==f.state&&(f.__s=He({},f.__s)),He(f.__s,z.getDerivedStateFromProps(w,f.__s))),p=f.props,b=f.state,f.__v=t,d)S&&z.getDerivedStateFromProps==null&&f.componentWillMount!=null&&f.componentWillMount(),S&&f.componentDidMount!=null&&f.__h.push(f.componentDidMount);else{if(S&&z.getDerivedStateFromProps==null&&w!==p&&f.componentWillReceiveProps!=null&&f.componentWillReceiveProps(w,P),!f.__e&&(f.shouldComponentUpdate!=null&&f.shouldComponentUpdate(w,f.__s,P)===!1||t.__v==n.__v)){for(t.__v!=n.__v&&(f.props=w,f.state=f.__s,f.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(O){O&&(O.__=t)}),$=0;$<f._sb.length;$++)f.__h.push(f._sb[$]);f._sb=[],f.__h.length&&l.push(f);break e}f.componentWillUpdate!=null&&f.componentWillUpdate(w,f.__s,P),S&&f.componentDidUpdate!=null&&f.__h.push(function(){f.componentDidUpdate(p,b,E)})}if(f.context=P,f.props=w,f.__P=e,f.__e=!1,y=U.__r,F=0,S){for(f.state=f.__s,f.__d=!1,y&&y(t),h=f.render(f.props,f.state,f.context),N=0;N<f._sb.length;N++)f.__h.push(f._sb[N]);f._sb=[]}else do f.__d=!1,y&&y(t),h=f.render(f.props,f.state,f.context),f.state=f.__s;while(f.__d&&++F<25);f.state=f.__s,f.getChildContext!=null&&(i=He(He({},i),f.getChildContext())),S&&!d&&f.getSnapshotBeforeUpdate!=null&&(E=f.getSnapshotBeforeUpdate(p,b)),s=eo(e,gr(W=h!=null&&h.type===ge&&h.key==null?h.props.children:h)?W:[W],t,n,i,a,o,l,s,c,u),f.base=t.__e,t.__u&=-161,f.__h.length&&l.push(f),T&&(f.__E=f.__=null)}catch(O){if(t.__v=null,c||o!=null)if(O.then){for(t.__u|=c?160:128;s&&s.nodeType==8&&s.nextSibling;)s=s.nextSibling;o[o.indexOf(s)]=null,t.__e=s}else for(x=o.length;x--;)xr(o[x]);else t.__e=n.__e,t.__k=n.__k;U.__e(O,t,n)}else o==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):s=t.__e=pl(n.__e,t,n,i,a,o,l,c,u);return(h=U.diffed)&&h(t),128&t.__u?void 0:s}r(br,"j");function no(e,t,n){for(var i=0;i<n.length;i++)kr(n[i],n[++i],n[++i]);U.__c&&U.__c(t,e),e.some(function(a){try{e=a.__h,a.__h=[],e.some(function(o){o.call(a)})}catch(o){U.__e(o,a.__v)}})}r(no,"z");function pl(e,t,n,i,a,o,l,s,c){var u,h,f,d,p,b,E,T=n.props,w=t.props,S=t.type;if(S=="svg"?a="http://www.w3.org/2000/svg":S=="math"?a="http://www.w3.org/1998/Math/MathML":a||(a="http://www.w3.org/1999/xhtml"),o!=null){for(u=0;u<o.length;u++)if((p=o[u])&&"setAttribute"in p==!!S&&(S?p.localName==S:p.nodeType==3)){e=p,o[u]=null;break}}if(e==null){if(S==null)return document.createTextNode(w);e=document.createElementNS(a,S,w.is&&w),s&&(U.__m&&U.__m(t,o),s=!1),o=null}if(S===null)T===w||s&&e.data===w||(e.data=w);else{if(o=o&&cn.call(e.childNodes),T=n.props||Rt,!s&&o!=null)for(T={},u=0;u<e.attributes.length;u++)T[(p=e.attributes[u]).name]=p.value;for(u in T)if(p=T[u],u!="children"){if(u=="dangerouslySetInnerHTML")f=p;else if(!(u in w)){if(u=="value"&&"defaultValue"in w||u=="checked"&&"defaultChecked"in w)continue;an(e,u,null,p,a)}}for(u in w)p=w[u],u=="children"?d=p:u=="dangerouslySetInnerHTML"?h=p:u=="value"?b=p:u=="checked"?E=p:s&&typeof p!="function"||T[u]===p||an(e,u,p,T[u],a);if(h)s||f&&(h.__html===f.__html||h.__html===e.innerHTML)||(e.innerHTML=h.__html),t.__k=[];else if(f&&(e.innerHTML=""),eo(e,gr(d)?d:[d],t,n,i,S=="foreignObject"?"http://www.w3.org/1999/xhtml":a,o,l,o?o[0]:n.__k&&bt(n,0),s,c),o!=null)for(u=o.length;u--;)xr(o[u]);s||(u="value",S=="progress"&&b==null?e.removeAttribute("value"):b!==void 0&&(b!==e[u]||S=="progress"&&!b||S=="option"&&b!==T[u])&&an(e,u,b,T[u],a),u="checked",E!==void 0&&E!==e[u]&&an(e,u,E,T[u],a))}return e}r(pl,"N");function kr(e,t,n){try{if(typeof e=="function"){var i=typeof e.__u=="function";i&&e.__u(),i&&t==null||(e.__u=e(t))}else e.current=t}catch(a){U.__e(a,n)}}r(kr,"V");function ro(e,t,n){var i,a;if(U.unmount&&U.unmount(e),(i=e.ref)&&(i.current&&i.current!==e.__e||kr(i,null,t)),(i=e.__c)!=null){if(i.componentWillUnmount)try{i.componentWillUnmount()}catch(o){U.__e(o,t)}i.base=i.__P=null}if(i=e.__k)for(a=0;a<i.length;a++)i[a]&&ro(i[a],t,n||typeof e.type!="function");n||xr(e.__e),e.__c=e.__=e.__e=void 0}r(ro,"q");function dl(e,t,n){return this.constructor(e,n)}r(dl,"B");function Ue(e,t,n){var i,a,o,l;t==document&&(t=document.documentElement),U.__&&U.__(e,t),a=(i=typeof n=="function")?null:n&&n.__k||t.__k,o=[],l=[],br(t,e=(!i&&n||t).__k=Y(ge,null,[e]),a||Rt,Rt,t.namespaceURI,!i&&n?[n]:a?null:t.firstChild?cn.call(t.childNodes):null,o,!i&&n?n:a?a.__e:t.firstChild,i,l),no(o,e,l)}r(Ue,"D");function wr(e,t){Ue(e,t,wr)}r(wr,"E");cn=Zi.slice,U={__e:r(function(e,t,n,i){for(var a,o,l;t=t.__;)if((a=t.__c)&&!a.__)try{if((o=a.constructor)&&o.getDerivedStateFromError!=null&&(a.setState(o.getDerivedStateFromError(e)),l=a.__d),a.componentDidCatch!=null&&(a.componentDidCatch(e,i||{}),l=a.__d),l)return a.__E=a}catch(s){e=s}throw e},"__e")},Ki=0,dr=r(function(e){return e!=null&&e.constructor==null},"t"),$e.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!==this.state?this.__s:this.__s=He({},this.state),typeof e=="function"&&(e=e(He({},n),this.props)),e&&He(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),Vi(this))},$e.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Vi(this))},$e.prototype.render=ge,Ze=[],Ji=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,fr=r(function(e,t){return e.__v.__b-t.__v.__b},"e"),sn.__r=0,Yi=/(PointerCapture)$|Capture$/i,mr=0,hr=Qi(!1),pr=Qi(!0),cl=0;var kt,K,yr,io,Bt=0,ho=[],X=U,oo=X.__b,ao=X.__r,lo=X.diffed,so=X.__c,co=X.unmount,uo=X.__;function fn(e,t){X.__h&&X.__h(K,e,Bt||t),Bt=0;var n=K.__H||(K.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}r(fn,"d");function po(e){return Bt=1,ml(bo,e)}r(po,"h");function ml(e,t,n){var i=fn(kt++,2);if(i.t=e,!i.__c&&(i.__=[n?n(t):bo(void 0,t),function(s){var c=i.__N?i.__N[0]:i.__[0],u=i.t(c,s);c!==u&&(i.__N=[u,i.__[1]],i.__c.setState({}))}],i.__c=K,!K.u)){var a=r(function(s,c,u){if(!i.__c.__H)return!0;var h=i.__c.__H.__.filter(function(d){return!!d.__c});if(h.every(function(d){return!d.__N}))return!o||o.call(this,s,c,u);var f=i.__c.props!==s;return h.forEach(function(d){if(d.__N){var p=d.__[0];d.__=d.__N,d.__N=void 0,p!==d.__[0]&&(f=!0)}}),o&&o.call(this,s,c,u)||f},"f");K.u=!0;var o=K.shouldComponentUpdate,l=K.componentWillUpdate;K.componentWillUpdate=function(s,c,u){if(this.__e){var h=o;o=void 0,a(s,c,u),o=h}l&&l.call(this,s,c,u)},K.shouldComponentUpdate=a}return i.__N||i.__}r(ml,"p");function We(e,t){var n=fn(kt++,3);!X.__s&&xo(n.__H,t)&&(n.__=e,n.i=t,K.__H.__h.push(n))}r(We,"y");function _r(e){return Bt=5,Xe(function(){return{current:e}},[])}r(_r,"A");function Xe(e,t){var n=fn(kt++,7);return xo(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}r(Xe,"T");function mo(e,t){return Bt=8,Xe(function(){return e},t)}r(mo,"q");function go(e){var t=K.context[e.__c],n=fn(kt++,9);return n.c=e,t?(n.__==null&&(n.__=!0,t.sub(K)),t.props.value):e.__}r(go,"x");function gl(){for(var e;e=ho.shift();)if(e.__P&&e.__H)try{e.__H.__h.forEach(un),e.__H.__h.forEach(vr),e.__H.__h=[]}catch(t){e.__H.__h=[],X.__e(t,e.__v)}}r(gl,"j");X.__b=function(e){K=null,oo&&oo(e)},X.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),uo&&uo(e,t)},X.__r=function(e){ao&&ao(e),kt=0;var t=(K=e.__c).__H;t&&(yr===K?(t.__h=[],K.__h=[],t.__.forEach(function(n){n.__N&&(n.__=n.__N),n.i=n.__N=void 0})):(t.__h.forEach(un),t.__h.forEach(vr),t.__h=[],kt=0)),yr=K},X.diffed=function(e){lo&&lo(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(ho.push(t)!==1&&io===X.requestAnimationFrame||((io=X.requestAnimationFrame)||xl)(gl)),t.__H.__.forEach(function(n){n.i&&(n.__H=n.i),n.i=void 0})),yr=K=null},X.__c=function(e,t){t.some(function(n){try{n.__h.forEach(un),n.__h=n.__h.filter(function(i){return!i.__||vr(i)})}catch(i){t.some(function(a){a.__h&&(a.__h=[])}),t=[],X.__e(i,n.__v)}}),so&&so(e,t)},X.unmount=function(e){co&&co(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.forEach(function(i){try{un(i)}catch(a){t=a}}),n.__H=void 0,t&&X.__e(t,n.__v))};var fo=typeof requestAnimationFrame=="function";function xl(e){var t,n=r(function(){clearTimeout(i),fo&&cancelAnimationFrame(t),setTimeout(e)},"r"),i=setTimeout(n,100);fo&&(t=requestAnimationFrame(n))}r(xl,"w");function un(e){var t=K,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),K=t}r(un,"z");function vr(e){var t=K;e.__c=e.__(),K=t}r(vr,"B");function xo(e,t){return!e||e.length!==t.length||t.some(function(n,i){return n!==e[i]})}r(xo,"C");function bo(e,t){return typeof t=="function"?t(e):t}r(bo,"D");var wo=r(function(e,t,n,i){var a;t[0]=0;for(var o=1;o<t.length;o++){var l=t[o++],s=t[o]?(t[0]|=l?1:2,n[t[o++]]):t[++o];l===3?i[0]=s:l===4?i[1]=Object.assign(i[1]||{},s):l===5?(i[1]=i[1]||{})[t[++o]]=s:l===6?i[1][t[++o]]+=s+"":l?(a=e.apply(s,wo(e,s,n,["",null])),i.push(a),s[0]?t[0]|=2:(t[o-2]=0,t[o]=a)):i.push(s)}return i},"n"),ko=new Map;function Sr(e){var t=ko.get(this);return t||(t=new Map,ko.set(this,t)),(t=wo(this,t.get(e)||(t.set(e,t=(function(n){for(var i,a,o=1,l="",s="",c=[0],u=function(d){o===1&&(d||(l=l.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?c.push(0,d,l):o===3&&(d||l)?(c.push(3,d,l),o=2):o===2&&l==="..."&&d?c.push(4,d,0):o===2&&l&&!d?c.push(5,0,!0,l):o>=5&&((l||!d&&o===5)&&(c.push(o,0,l,a),o=6),d&&(c.push(o,d,0,a),o=6)),l=""},h=0;h<n.length;h++){h&&(o===1&&u(),u(h));for(var f=0;f<n[h].length;f++)i=n[h][f],o===1?i==="<"?(u(),c=[c],o=3):l+=i:o===4?l==="--"&&i===">"?(o=1,l=""):l=i+l[0]:s?i===s?s="":l+=i:i==='"'||i==="'"?s=i:i===">"?(u(),o=1):o&&(i==="="?(o=5,a=l,l=""):i==="/"&&(o<5||n[h][f+1]===">")?(u(),o===3&&(c=c[0]),o=c,(c=c[0]).push(2,0,o),o=0):i===" "||i==="	"||i===`
`||i==="\r"?(u(),o=2):l+=i),o===3&&l==="!--"&&(o=4,c=c[0])}return u(),c})(e)),t),arguments,[])).length>1?t:t[0]}r(Sr,"default");var A=Sr.bind(Y);var bl=Symbol.for("preact-signals");function mn(){if(ze>1)ze--;else{var e,t=!1;for((function(){var a=pn;for(pn=void 0;a!==void 0;){var o=a.S;if(o.v===a.v)for(var l=o.t;l!==void 0;l=l.x)l.i===a.i&&(l.i=o.i);a=a.o}})();Mt!==void 0;){var n=Mt;for(Mt=void 0,hn++;n!==void 0;){var i=n.u;if(n.u=void 0,n.f&=-3,!(8&n.f)&&vo(n))try{n.c()}catch(a){t||(e=a,t=!0)}n=i}}if(hn=0,ze--,t)throw e}}r(mn,"t");function Ot(e){if(ze>0)return e();Cr=++kl,ze++;try{return e()}finally{mn()}}r(Ot,"n");var Nt,Q=void 0;function Ht(e){var t=Q,n=Nt;Q=void 0,Nt=void 0;try{return e()}finally{Q=t,Nt=n}}r(Ht,"f");var Mt=void 0,ze=0,hn=0,kl=0,Cr=0,pn=void 0,dn=0;function yo(e){if(Q!==void 0){var t=e.n;if(t===void 0||t.t!==Q)return t={i:0,S:e,p:Q.s,n:void 0,t:Q,e:void 0,x:void 0,r:t},Q.s!==void 0&&(Q.s.n=t),Q.s=t,e.n=t,32&Q.f&&e.S(t),t;if(t.i===-1)return t.i=0,t.n!==void 0&&(t.n.p=t.p,t.p!==void 0&&(t.p.n=t.n),t.p=Q.s,t.n=void 0,Q.s.n=t,Q.s=t),t}}r(yo,"a");function ne(e,t){this.v=e,this.i=0,this.n=void 0,this.t=void 0,this.l=0,this.W=t?.watched,this.Z=t?.unwatched,this.name=t?.name}r(ne,"l");ne.prototype.brand=bl;ne.prototype.h=function(){return!0};ne.prototype.S=function(e){var t=this,n=this.t;n!==e&&e.e===void 0&&(e.x=n,this.t=e,n!==void 0?n.e=e:Ht(function(){var i;(i=t.W)==null||i.call(t)}))};ne.prototype.U=function(e){var t=this;if(this.t!==void 0){var n=e.e,i=e.x;n!==void 0&&(n.x=i,e.e=void 0),i!==void 0&&(i.e=n,e.x=void 0),e===this.t&&(this.t=i,i===void 0&&Ht(function(){var a;(a=t.Z)==null||a.call(t)}))}};ne.prototype.subscribe=function(e){var t=this;return pe(function(){var n=t.value;Ht(function(){return e(n)})},{name:"sub"})};ne.prototype.valueOf=function(){return this.value};ne.prototype.toString=function(){return this.value+""};ne.prototype.toJSON=function(){return this.value};ne.prototype.peek=function(){var e=this;return Ht(function(){return e.value})};Object.defineProperty(ne.prototype,"value",{get:r(function(){var e=yo(this);return e!==void 0&&(e.i=this.i),this.v},"get"),set:r(function(e){if(e!==this.v){if(hn>100)throw new Error("Cycle detected");(function(n){ze!==0&&hn===0&&n.l!==Cr&&(n.l=Cr,pn={S:n,v:n.v,i:n.i,o:pn})})(this),this.v=e,this.i++,dn++,ze++;try{for(var t=this.t;t!==void 0;t=t.x)t.t.N()}finally{mn()}}},"set")});function V(e,t){return new ne(e,t)}r(V,"y");function vo(e){for(var t=e.s;t!==void 0;t=t.n)if(t.S.i!==t.i||!t.S.h()||t.S.i!==t.i)return!0;return!1}r(vo,"w");function _o(e){for(var t=e.s;t!==void 0;t=t.n){var n=t.S.n;if(n!==void 0&&(t.r=n),t.S.n=t,t.i=-1,t.n===void 0){e.s=t;break}}}r(_o,"_");function So(e){for(var t=e.s,n=void 0;t!==void 0;){var i=t.p;t.i===-1?(t.S.U(t),i!==void 0&&(i.n=t.n),t.n!==void 0&&(t.n.p=i)):n=t,t.S.n=t.r,t.r!==void 0&&(t.r=void 0),t=i}e.s=n}r(So,"b");function et(e,t){ne.call(this,void 0,t),this.x=e,this.s=void 0,this.g=dn-1,this.f=4}r(et,"p");et.prototype=new ne;et.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if((36&this.f)==32||(this.f&=-5,this.g===dn))return!0;if(this.g=dn,this.f|=1,this.i>0&&!vo(this))return this.f&=-2,!0;var e=Q;try{_o(this),Q=this;var t=this.x();(16&this.f||this.v!==t||this.i===0)&&(this.v=t,this.f&=-17,this.i++)}catch(n){this.v=n,this.f|=16,this.i++}return Q=e,So(this),this.f&=-2,!0};et.prototype.S=function(e){if(this.t===void 0){this.f|=36;for(var t=this.s;t!==void 0;t=t.n)t.S.S(t)}ne.prototype.S.call(this,e)};et.prototype.U=function(e){if(this.t!==void 0&&(ne.prototype.U.call(this,e),this.t===void 0)){this.f&=-33;for(var t=this.s;t!==void 0;t=t.n)t.S.U(t)}};et.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var e=this.t;e!==void 0;e=e.x)e.t.N()}};Object.defineProperty(et.prototype,"value",{get:r(function(){if(1&this.f)throw new Error("Cycle detected");var e=yo(this);if(this.h(),e!==void 0&&(e.i=this.i),16&this.f)throw this.v;return this.v},"get")});function je(e,t){return new et(e,t)}r(je,"g");function Co(e){var t=e.m;if(e.m=void 0,typeof t=="function"){ze++;var n=Q;Q=void 0;try{t()}catch(i){throw e.f&=-2,e.f|=8,Tr(e),i}finally{Q=n,mn()}}}r(Co,"S");function Tr(e){for(var t=e.s;t!==void 0;t=t.n)t.S.U(t);e.x=void 0,e.s=void 0,Co(e)}r(Tr,"m");function wl(e){if(Q!==this)throw new Error("Out-of-order effect");So(this),Q=e,this.f&=-2,8&this.f&&Tr(this),mn()}r(wl,"x");function wt(e,t){this.x=e,this.m=void 0,this.s=void 0,this.u=void 0,this.f=32,this.name=t?.name,Nt&&Nt.push(this)}r(wt,"E");wt.prototype.c=function(){var e=this.S();try{if(8&this.f||this.x===void 0)return;var t=this.x();typeof t=="function"&&(this.m=t)}finally{e()}};wt.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,Co(this),_o(this),ze++;var e=Q;return Q=this,wl.bind(this,e)};wt.prototype.N=function(){2&this.f||(this.f|=2,this.u=Mt,Mt=this)};wt.prototype.d=function(){this.f|=8,1&this.f||Tr(this)};wt.prototype.dispose=function(){this.d()};function pe(e,t){var n=new wt(e,t);try{n.c()}catch(a){throw n.d(),a}var i=n.d.bind(n);return i[Symbol.dispose]=i,i}r(pe,"j");var To,Er,Ar;var Ao=[];pe(function(){To=this.N})();function yt(e,t){U[e]=t.bind(null,U[e]||function(){})}r(yt,"_");function gn(e){Ar&&Ar(),Ar=e&&e.S()}r(gn,"m");function Eo(e){var t=this,n=e.data,i=ke(n);i.value=n;var a=Xe(function(){for(var s=t,c=t.__v;c=c.__;)if(c.__c){c.__c.__$f|=4;break}var u=je(function(){var p=i.value.value;return p===0?0:p===!0?"":p||""}),h=je(function(){return!dr(u.value)}),f=pe(function(){if(this.N=Io,h.value){var p=u.value;s.base&&s.base.nodeType===3&&(s.base.data=p)}}),d=t.__$u.d;return t.__$u.d=function(){f(),d.call(this)},[h,u]},[]),o=a[0],l=a[1];return o.value?l.peek():l.value}r(Eo,"g");Eo.displayName="_st";Object.defineProperties(ne.prototype,{constructor:{configurable:!0,value:void 0},type:{configurable:!0,value:Eo},props:{configurable:!0,get:r(function(){return{data:this}},"get")},__b:{configurable:!0,value:1}});yt("__b",function(e,t){if(typeof t.type=="string"){var n,i=t.props;for(var a in i)if(a!=="children"){var o=i[a];o instanceof ne&&(n||(t.__np=n={}),n[a]=o,i[a]=o.peek())}}e(t)});yt("__r",function(e,t){gn();var n,i=t.__c;i&&(i.__$f&=-2,(n=i.__$u)===void 0&&(i.__$u=n=(function(a){var o;return pe(function(){o=this}),o.c=function(){i.__$f|=1,i.setState({})},o})())),Er=i,gn(n),e(t)});yt("__e",function(e,t,n,i){gn(),Er=void 0,e(t,n,i)});yt("diffed",function(e,t){gn(),Er=void 0;var n;if(typeof t.type=="string"&&(n=t.__e)){var i=t.__np,a=t.props;if(i){var o=n.U;if(o)for(var l in o){var s=o[l];s!==void 0&&!(l in i)&&(s.d(),o[l]=void 0)}else o={},n.U=o;for(var c in i){var u=o[c],h=i[c];u===void 0?(u=yl(n,c,h,a),o[c]=u):u.o(h,a)}}}e(t)});function yl(e,t,n,i){var a=t in e&&e.ownerSVGElement===void 0,o=V(n);return{o:r(function(l,s){o.value=l,i=s},"o"),d:pe(function(){this.N=Io;var l=o.value.value;i[t]!==l&&(i[t]=l,a?e[t]=l:l?e.setAttribute(t,l):e.removeAttribute(t))})}}r(yl,"b");yt("unmount",function(e,t){if(typeof t.type=="string"){var n=t.__e;if(n){var i=n.U;if(i){n.U=void 0;for(var a in i){var o=i[a];o&&o.d()}}}}else{var l=t.__c;if(l){var s=l.__$u;s&&(l.__$u=void 0,s.d())}}e(t)});yt("__h",function(e,t,n,i){(i<3||i===9)&&(t.__$f|=2),e(t,n,i)});$e.prototype.shouldComponentUpdate=function(e,t){var n=this.__$u,i=n&&n.s!==void 0;for(var a in t)return!0;if(this.__f||typeof this.u=="boolean"&&this.u===!0){var o=2&this.__$f;if(!(i||o||4&this.__$f)||1&this.__$f)return!0}else if(!(i||4&this.__$f)||3&this.__$f)return!0;for(var l in e)if(l!=="__source"&&e[l]!==this.props[l])return!0;for(var s in this.props)if(!(s in e))return!0;return!1};function ke(e){return Xe(function(){return V(e)},[])}r(ke,"useSignal");var vl=r(function(e){queueMicrotask(function(){queueMicrotask(e)})},"k");function _l(){Ot(function(){for(var e;e=Ao.shift();)To.call(e)})}r(_l,"x");function Io(){Ao.push(this)===1&&(U.requestAnimationFrame||vl)(_l)}r(Io,"A");var Or={};Wi(Or,{WIDE_SCREEN_MIN_PX:()=>Wt,articleTree:()=>Fo,articles:()=>ae,cleanMarkdownText:()=>zo,closeSearch:()=>jt,closeTocModal:()=>At,currentDoc:()=>St,currentPath:()=>Ae,errorMessage:()=>Tt,flattenArticles:()=>qo,isArticlesLoading:()=>qr,isLoading:()=>Ct,isOffline:()=>qe,isSWActive:()=>Re,isWideScreen:()=>j,loadArticles:()=>Cn,openSearch:()=>rt,parseTimeMs:()=>Nr,restoreSearchIndexFromCache:()=>Mo,searchDocs:()=>nt,searchOpen:()=>Te,searchQuery:()=>Sn,sidebarOpen:()=>ue,tocModalOpen:()=>it,tocRailOpen:()=>Be,toggleTocModal:()=>Br,viewMode:()=>Mr,viewportHeight:()=>_n});function Sl(e){let t={};if(!e||!e.trim())return t;let n=e.split(/\r?\n/),i=null,a=null,o=null;for(let l of n){let s=l,c=s.trim();if(!c||c.startsWith("#"))continue;let u=s.match(/^(\s*)-\s+(.*)$/);if(u&&u[2]!==void 0&&i){a||(a=[],t[i]=a);let d=u[2].trim(),p=d.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);if(p&&p[1]&&p[2]!==void 0){o={},a.push(o);let b=p[1],E=p[2].trim().replace(/^["'`]|["'`]$/g,"");o[b]=E}else{let b=d.replace(/^["'`]|["'`]$/g,"");a.push(b),o=null}continue}let h=s.match(/^\s{2,}([A-Za-z0-9_-]+)\s*:\s*(.*)$/);if(h&&h[1]&&h[2]!==void 0&&o){let d=h[1],p=h[2].trim().replace(/^["'`]|["'`]$/g,"");o[d]=p;continue}let f=s.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);if(f&&f[1]&&f[2]!==void 0){let d=f[1],p=f[2].trim();if(i=d,a=null,o=null,!p)t[d]=null;else if(p.startsWith("[")&&p.endsWith("]"))try{t[d]=JSON.parse(p)}catch{t[d]=p.slice(1,-1).split(",").map(b=>b.trim().replace(/^["'`]|["'`]$/g,""))}else{let b=p.replace(/^["'`]|["'`]$/g,"");b==="true"?b=!0:b==="false"?b=!1:!isNaN(Number(b))&&b!==""&&(b=Number(b)),t[d]=b}}}return t}r(Sl,"parseYAML");function Ut(e){if(!e)return{frontmatter:{},body:""};let t=e.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);if(!t)return{frontmatter:{},body:e};let n=t[1]||"",i=e.slice(t[0].length);return{frontmatter:Sl(n),body:i}}r(Ut,"parseFrontmatter");function xn(e){return new Promise((t,n)=>{e.oncomplete=e.onsuccess=()=>t(e.result),e.onabort=e.onerror=()=>n(e.error)})}r(xn,"promisifyRequest");function Cl(e,t){let n,i=r(()=>{if(n)return n;let a=indexedDB.open(e);return a.onupgradeneeded=()=>a.result.createObjectStore(t),n=xn(a),n.then(o=>{o.onclose=()=>n=void 0},()=>{n=void 0}),n},"getDB");return(a,o)=>i().then(l=>o(l.transaction(t,a).objectStore(t)))}r(Cl,"createStore");var Ir;function Lr(){return Ir||(Ir=Cl("keyval-store","keyval")),Ir}r(Lr,"defaultGetStore");function vt(e,t=Lr()){return t("readonly",n=>xn(n.get(e)))}r(vt,"get");function _t(e,t,n=Lr()){return n("readwrite",i=>(i.put(t,e),xn(i.transaction)))}r(_t,"set");function Lo(e,t=Lr()){return t("readwrite",n=>(n.delete(e),xn(n.transaction)))}r(Lo,"del");function bn(){return typeof navigator>"u"||!("serviceWorker"in navigator)?!1:!!navigator.serviceWorker.controller}r(bn,"isSWControlling");function kn(){if(typeof globalThis>"u"||!globalThis.location)return"./";let{origin:e,pathname:t}=globalThis.location;if(!e||e==="null")return"./";if(t.endsWith(".html")){let i=t.substring(0,t.lastIndexOf("/")+1);return`${e}${i}`}let n=t.endsWith("/")?t:`${t}/`;return`${e}${n}`}r(kn,"getAppBaseUrl");function tt(e,t="./articles"){let n=(e||"").trim();n.includes("#")&&(n=n.substring(n.indexOf("#")+1)),n=n.replace(/\?.*$/,"");let i=t.replace(/^\.?\//,"").replace(/\/$/,"");if(n===""||n==="/"||n==="./"||n===`/${i}`||n===`${i}`)return{docPath:`/${i}/index.md`,isDoc:!0};if(!(n.includes(`/${i}/`)||n.startsWith(`${i}/`)||n.startsWith(`./${i}/`)||n.endsWith(`/${i}`)||n.endsWith(`/${i}/`)||n.includes("/docs/")||n.startsWith("docs/")||n.endsWith(".md")))return{docPath:n,isDoc:!1};let o=n;return o.endsWith(".md")||(o.endsWith(`/${i}`)||o.endsWith(`/${i}/`)?o=`${o.replace(/\/+$/,"")}/index.md`:o=`${o}.md`),!o.includes(`/${i}`)&&!o.startsWith(`${i}`)&&!o.includes("/docs/")&&(o=`/${i}/${o.replace(/^\.?\//,"")}`),!o.startsWith("/")&&!o.startsWith("./")&&(o=`/${o}`),o=o.replace(/\/+/g,"/"),{docPath:o,isDoc:!0}}r(tt,"resolveDocPath");function wn(e,t){if(!e)return"";let n=t.startsWith("/")?t:`/${t}`,i=n.endsWith("/")?n:`${n}/`;return e.startsWith(i)?e.slice(i.length):e.startsWith("./")?e.slice(2):e.replace(/^\//,"")}r(wn,"toBaseRelativePath");function yn(e){return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-")}r(yn,"slugify");function ce(e){let t=(e||"").replace(/^#\/?/,"").replace(/^\.?\//,"").replace(/^articles\//,"").replace(/^docs\//,"");return(!t||t==="/"||t==="index")&&(t="index.md"),t}r(ce,"normalizePath");function Ce(e){let t=ce(e);return t==="index.md"?"#/":`#/${t}`}r(Ce,"articleHrefFromPath");function Dr(e){if(typeof e=="string")return e;if(typeof e=="number"||typeof e=="boolean")return String(e);if(!e||typeof e!="object")return"";if(Array.isArray(e))return e.map(Dr).join("");let t=e.c;return Array.isArray(t)?t.map(Dr).join(""):""}r(Dr,"extractText");function Fr(e,t=3){let n=[],i=r(a=>{if(!a||typeof a!="object")return;if(Array.isArray(a)){for(let l of a)i(l);return}let o=a;if(o.t==="c"&&o.n==="Heading"){let l=Number(o.p?.depth??1),s=typeof o.p?.id=="string"?o.p.id:"";s&&l>=2&&l<=t&&n.push({id:s,text:Dr(o.c??[]),depth:l})}if(Array.isArray(o.c))for(let l of o.c)i(l)},"walk");return i(e),n}r(Fr,"extractTocHeadings");function Pr(e,t=200){if(!e)return 1;let i=e.replace(/^---[\s\S]*?---/," ").split(/\s+/).filter(a=>a.length>0).length;return Math.max(1,Math.round(i/Math.max(1,t)))}r(Pr,"estimateReadingTimeMinutes");function $r(e,t){let n=e.findIndex(i=>ce(i.path)===ce(t));return n<0?{prev:null,next:null}:{prev:n>0?e[n-1]??null:null,next:n<e.length-1?e[n+1]??null:null}}r($r,"findAdjacentArticles");var zr=[{heightClass:"large-height",maxHeightPx:576,minViewportPx:720},{heightClass:"medium-height",maxHeightPx:384,minViewportPx:480},{heightClass:"small-height",maxHeightPx:192,minViewportPx:0}];function Do(e){let t=zr.find(n=>e>=n.minViewportPx);return t?{heightClass:t.heightClass,maxHeightPx:t.maxHeightPx}:{heightClass:"small-height",maxHeightPx:192}}r(Do,"tocRailHeight");var ae=V([]),Fo=V([]),qr=V(!1),nt=V([]),Ae=V("./articles/index.md"),St=V(null),Ct=V(!0),Tt=V(null),qe=V(typeof navigator<"u"?!navigator.onLine:!1),Re=V(!1),Wt=993,Rr="mdblog-sidebar";function Tl(){if(typeof window<"u"&&window.innerWidth<Wt)return!1;try{if(typeof localStorage<"u"){let e=localStorage.getItem(Rr);if(e==="open")return!0;if(e==="closed")return!1}}catch{}return!0}r(Tl,"readSidebarPreference");var ue=V(Tl()),j=V(typeof window<"u"?window.innerWidth>=Wt:!0),_n=V(typeof window<"u"?window.innerHeight:0),Te=V(!1),Sn=V("");function rt(){Te.value=!0}r(rt,"openSearch");function jt(){Te.value=!1,Sn.value=""}r(jt,"closeSearch");var vn=V(null),it=je(()=>vn.value!==null&&vn.value===Ae.value&&!j.value);function Br(){vn.value=it.value?null:Ae.value}r(Br,"toggleTocModal");function At(){vn.value=null}r(At,"closeTocModal");var Po="mdblog-toc";function Al(){try{if(typeof localStorage<"u")return localStorage.getItem(Po)!=="closed"}catch{}return!0}r(Al,"readTocPreference");var Be=V(Al()),Nr=V(0),Mr=V("preview"),El=[[["index","home","in\xEDcio","start"],"home"],[["readme","overview"],"article"],[["guia","guide","demo","pratico"],"science"],[["html","migracao","migration","code"],"code"],[["wire","ast","spec","schema"],"schema"],[["island","ilha"],"widgets"],[["fluxo","flow","ciclo","vida"],"sync"],[["plano","plan","desenvolvimento","roadmap"],"checklist"]];function $o(e,t){let n=`${e} ${t}`.toLowerCase();for(let[i,a]of El)if(i.some(o=>n.includes(o)))return a;return"description"}r($o,"inferArticleIcon");function Il(e,t){let n=e.split(`
`);for(let i of n){let a=i.trim();if(a.startsWith("# "))return a.replace(/^#\s+/,"").trim()}return t.replace(/\.md$/,"")}r(Il,"extractTitleFromMarkdown");function zo(e){return e?e.replace(/^#+\s+/gm," ").replace(/```[\s\S]*?```/g," ").replace(/`([^`]+)`/g,"$1").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/[*_~`#>-]/g," ").replace(/\s+/g," ").trim():""}r(zo,"cleanMarkdownText");function qo(e){let t=[];function n(i){if(t.push(i),i.children&&i.children.length>0)for(let a of i.children)n(a)}r(n,"traverse");for(let i of e)n(i);return t}r(qo,"flattenArticles");async function Ro(e){let t=`${kn()}articles/${e}`;try{let n=await fetch(`${t}?_md_raw=1`);if(n.ok)return await n.text();let i=await fetch(t);if(i.ok)return await i.text()}catch{}return""}r(Ro,"fetchArticleText");function Bo(e,t,n,i,a){let{frontmatter:o,body:l}=t,s=e.replace(/\.md$/,""),c=o.title||(n===0?"Home page":Il(l,e)),u=o.icon||$o(s,c),h=`./articles/${e}`,f=Array.isArray(o.tags)?o.tags:o.tag?[o.tag]:[],d={name:e,slug:s,path:h,title:c,icon:u,badge:o.badge,date:o.date,location:o.location||`#/articles/${e}`,author:o.author,description:o.description,tags:f,depth:n,parentPath:i,children:[]};return a.push({path:h,title:c,description:o.description||"",content:zo(l),tags:f,icon:u,badge:o.badge,depth:n}),d}r(Bo,"buildArticleItem");async function No(e,t,n,i,a){let o=typeof e=="string"?e.trim():(e?.path||"").trim(),l=o.replace(/^\.?\//,"");if(!l||i.has(l))return null;i.add(l);try{let s=await Ro(l),c=Ut(s),u=Bo(l,c,t,n,a),h=c.frontmatter.pages||c.frontmatter.articles||c.frontmatter.subpages;if(Array.isArray(h)&&h.length>0){let f=[];for(let d of h){let p=await No(d,t+1,u.path,i,a);p&&f.push(p)}u.children=f}return u}catch(s){console.warn(`[state] Failed to process page ${l}:`,s);let c=l.replace(/\.md$/,"");return{name:l,slug:c,path:`./articles/${l}`,title:o,icon:$o(c,o),depth:t,parentPath:n,children:[]}}}r(No,"loadPageRecursive");async function Mo(){try{let e=await vt("mdblog-search-index");Array.isArray(e)&&e.length>0&&(nt.value=e)}catch{}}r(Mo,"restoreSearchIndexFromCache");async function Cn(){qr.value=!0;try{let e=await Ro("index.md");if(e){let t=Ut(e),n=t.frontmatter.pages||t.frontmatter.articles||t.frontmatter.subpages||[],i=new Set(["index.md"]),a=[],o=Bo("index.md",t,0,void 0,a),l=[];if(Array.isArray(n))for(let u of n){let h=await No(u,1,o.path,i,a);h&&l.push(h)}o.children=l;let s=[o],c=qo(s);Fo.value=s,ae.value=c,nt.value=a;try{await _t("browser-articles-cache",c),await _t("mdblog-search-index",a)}catch{}return ae.value}try{let t=await vt("browser-articles-cache");if(t&&Array.isArray(t)&&t.length>0&&(ae.value=t),ae.value.length>0)return ae.value}catch{}return ae.value}finally{qr.value=!1,nt.value.length===0&&await Mo()}}r(Cn,"loadArticles");if(typeof window<"u"){globalThis.addEventListener("online",()=>{qe.value=!1,Cn().catch(()=>{})}),globalThis.addEventListener("offline",()=>{qe.value=!0}),globalThis.addEventListener("keydown",t=>{(t.ctrlKey||t.metaKey)&&t.key.toLowerCase()==="k"?(t.preventDefault(),rt()):t.key==="Escape"&&Te.value&&jt()});let e=r(()=>{j.value=window.innerWidth>=Wt,_n.value=window.innerHeight},"syncViewport");if(globalThis.addEventListener("resize",e),typeof window.matchMedia=="function"){let t=[`(min-width: ${Wt}px)`,...zr.filter(n=>n.minViewportPx>0).map(n=>`(min-height: ${n.minViewportPx}px)`)];for(let n of t)window.matchMedia(n).addEventListener("change",e)}typeof document<"u"&&(pe(()=>{try{typeof localStorage<"u"&&localStorage.setItem(Po,Be.value?"open":"closed")}catch{}}),pe(()=>{let t=j.value;try{typeof localStorage<"u"&&(t?localStorage.setItem(Rr,ue.value?"open":"closed"):localStorage.removeItem(Rr))}catch{}}),pe(()=>{let t=!j.value,n=Te.value||t&&(ue.value||it.value);document.body.classList.toggle("no-scroll",n),document.documentElement.classList.toggle("no-scroll",n)}),pe(()=>{Te.value&&(At(),j.value||(ue.value=!1))}))}var Ho="mdblog-theme";function Uo(){try{if(typeof localStorage>"u")return null;let e=localStorage.getItem(Ho);return e==="dark"?!0:e==="light"?!1:null}catch{return null}}r(Uo,"readSavedTheme");function Ll(){let e=Uo();return e!==null?e:typeof document<"u"&&document.body.classList.contains("dark")?!0:typeof globalThis.matchMedia=="function"?globalThis.matchMedia("(prefers-color-scheme: dark)").matches:!1}r(Ll,"initialThemeIsDark");function Wo(){if(!(typeof document>"u"))try{let e=getComputedStyle(document.body).backgroundColor;if(!e||e==="transparent"||e==="rgba(0, 0, 0, 0)")return;let t=document.querySelector('meta[name="theme-color"]');t||(t=document.createElement("meta"),t.setAttribute("name","theme-color"),document.head.appendChild(t)),t.setAttribute("content",e)}catch{}}r(Wo,"syncThemeColor");function Oo(e){typeof document>"u"||(document.body.classList.remove(e?"light":"dark"),document.body.classList.remove("auto"),document.body.classList.add(e?"dark":"light"),Wo())}r(Oo,"applyTheme");function Tn({class:e=""}={}){let t=Uo(),n=ke(Ll());t!==null?Oo(t):Wo();function i(){n.value=!n.value,Oo(n.value);try{typeof localStorage<"u"&&localStorage.setItem(Ho,n.value?"dark":"light")}catch{}}return r(i,"toggle"),A`
    <button
      class=${`circle transparent ${e}`.trim()}
      onClick=${i}
      title=${n.value?"Switch to light mode":"Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <i>${n.value?"light_mode":"dark_mode"}</i>
    </button>
  `}r(Tn,"ThemeToggle");var Dl={};function Et(e,t){let n=t||Dl,i=typeof n.includeImageAlt=="boolean"?n.includeImageAlt:!0,a=typeof n.includeHtml=="boolean"?n.includeHtml:!0;return Vo(e,i,a)}r(Et,"toString");function Vo(e,t,n){if(Fl(e)){if("value"in e)return e.type==="html"&&!n?"":e.value;if(t&&"alt"in e&&e.alt)return e.alt;if("children"in e)return jo(e.children,t,n)}return Array.isArray(e)?jo(e,t,n):""}r(Vo,"one");function jo(e,t,n){let i=[],a=-1;for(;++a<e.length;)i[a]=Vo(e[a],t,n);return i.join("")}r(jo,"all");function Fl(e){return!!(e&&typeof e=="object")}r(Fl,"node");var Hr={AElig:"\xC6",AMP:"&",Aacute:"\xC1",Abreve:"\u0102",Acirc:"\xC2",Acy:"\u0410",Afr:"\u{1D504}",Agrave:"\xC0",Alpha:"\u0391",Amacr:"\u0100",And:"\u2A53",Aogon:"\u0104",Aopf:"\u{1D538}",ApplyFunction:"\u2061",Aring:"\xC5",Ascr:"\u{1D49C}",Assign:"\u2254",Atilde:"\xC3",Auml:"\xC4",Backslash:"\u2216",Barv:"\u2AE7",Barwed:"\u2306",Bcy:"\u0411",Because:"\u2235",Bernoullis:"\u212C",Beta:"\u0392",Bfr:"\u{1D505}",Bopf:"\u{1D539}",Breve:"\u02D8",Bscr:"\u212C",Bumpeq:"\u224E",CHcy:"\u0427",COPY:"\xA9",Cacute:"\u0106",Cap:"\u22D2",CapitalDifferentialD:"\u2145",Cayleys:"\u212D",Ccaron:"\u010C",Ccedil:"\xC7",Ccirc:"\u0108",Cconint:"\u2230",Cdot:"\u010A",Cedilla:"\xB8",CenterDot:"\xB7",Cfr:"\u212D",Chi:"\u03A7",CircleDot:"\u2299",CircleMinus:"\u2296",CirclePlus:"\u2295",CircleTimes:"\u2297",ClockwiseContourIntegral:"\u2232",CloseCurlyDoubleQuote:"\u201D",CloseCurlyQuote:"\u2019",Colon:"\u2237",Colone:"\u2A74",Congruent:"\u2261",Conint:"\u222F",ContourIntegral:"\u222E",Copf:"\u2102",Coproduct:"\u2210",CounterClockwiseContourIntegral:"\u2233",Cross:"\u2A2F",Cscr:"\u{1D49E}",Cup:"\u22D3",CupCap:"\u224D",DD:"\u2145",DDotrahd:"\u2911",DJcy:"\u0402",DScy:"\u0405",DZcy:"\u040F",Dagger:"\u2021",Darr:"\u21A1",Dashv:"\u2AE4",Dcaron:"\u010E",Dcy:"\u0414",Del:"\u2207",Delta:"\u0394",Dfr:"\u{1D507}",DiacriticalAcute:"\xB4",DiacriticalDot:"\u02D9",DiacriticalDoubleAcute:"\u02DD",DiacriticalGrave:"`",DiacriticalTilde:"\u02DC",Diamond:"\u22C4",DifferentialD:"\u2146",Dopf:"\u{1D53B}",Dot:"\xA8",DotDot:"\u20DC",DotEqual:"\u2250",DoubleContourIntegral:"\u222F",DoubleDot:"\xA8",DoubleDownArrow:"\u21D3",DoubleLeftArrow:"\u21D0",DoubleLeftRightArrow:"\u21D4",DoubleLeftTee:"\u2AE4",DoubleLongLeftArrow:"\u27F8",DoubleLongLeftRightArrow:"\u27FA",DoubleLongRightArrow:"\u27F9",DoubleRightArrow:"\u21D2",DoubleRightTee:"\u22A8",DoubleUpArrow:"\u21D1",DoubleUpDownArrow:"\u21D5",DoubleVerticalBar:"\u2225",DownArrow:"\u2193",DownArrowBar:"\u2913",DownArrowUpArrow:"\u21F5",DownBreve:"\u0311",DownLeftRightVector:"\u2950",DownLeftTeeVector:"\u295E",DownLeftVector:"\u21BD",DownLeftVectorBar:"\u2956",DownRightTeeVector:"\u295F",DownRightVector:"\u21C1",DownRightVectorBar:"\u2957",DownTee:"\u22A4",DownTeeArrow:"\u21A7",Downarrow:"\u21D3",Dscr:"\u{1D49F}",Dstrok:"\u0110",ENG:"\u014A",ETH:"\xD0",Eacute:"\xC9",Ecaron:"\u011A",Ecirc:"\xCA",Ecy:"\u042D",Edot:"\u0116",Efr:"\u{1D508}",Egrave:"\xC8",Element:"\u2208",Emacr:"\u0112",EmptySmallSquare:"\u25FB",EmptyVerySmallSquare:"\u25AB",Eogon:"\u0118",Eopf:"\u{1D53C}",Epsilon:"\u0395",Equal:"\u2A75",EqualTilde:"\u2242",Equilibrium:"\u21CC",Escr:"\u2130",Esim:"\u2A73",Eta:"\u0397",Euml:"\xCB",Exists:"\u2203",ExponentialE:"\u2147",Fcy:"\u0424",Ffr:"\u{1D509}",FilledSmallSquare:"\u25FC",FilledVerySmallSquare:"\u25AA",Fopf:"\u{1D53D}",ForAll:"\u2200",Fouriertrf:"\u2131",Fscr:"\u2131",GJcy:"\u0403",GT:">",Gamma:"\u0393",Gammad:"\u03DC",Gbreve:"\u011E",Gcedil:"\u0122",Gcirc:"\u011C",Gcy:"\u0413",Gdot:"\u0120",Gfr:"\u{1D50A}",Gg:"\u22D9",Gopf:"\u{1D53E}",GreaterEqual:"\u2265",GreaterEqualLess:"\u22DB",GreaterFullEqual:"\u2267",GreaterGreater:"\u2AA2",GreaterLess:"\u2277",GreaterSlantEqual:"\u2A7E",GreaterTilde:"\u2273",Gscr:"\u{1D4A2}",Gt:"\u226B",HARDcy:"\u042A",Hacek:"\u02C7",Hat:"^",Hcirc:"\u0124",Hfr:"\u210C",HilbertSpace:"\u210B",Hopf:"\u210D",HorizontalLine:"\u2500",Hscr:"\u210B",Hstrok:"\u0126",HumpDownHump:"\u224E",HumpEqual:"\u224F",IEcy:"\u0415",IJlig:"\u0132",IOcy:"\u0401",Iacute:"\xCD",Icirc:"\xCE",Icy:"\u0418",Idot:"\u0130",Ifr:"\u2111",Igrave:"\xCC",Im:"\u2111",Imacr:"\u012A",ImaginaryI:"\u2148",Implies:"\u21D2",Int:"\u222C",Integral:"\u222B",Intersection:"\u22C2",InvisibleComma:"\u2063",InvisibleTimes:"\u2062",Iogon:"\u012E",Iopf:"\u{1D540}",Iota:"\u0399",Iscr:"\u2110",Itilde:"\u0128",Iukcy:"\u0406",Iuml:"\xCF",Jcirc:"\u0134",Jcy:"\u0419",Jfr:"\u{1D50D}",Jopf:"\u{1D541}",Jscr:"\u{1D4A5}",Jsercy:"\u0408",Jukcy:"\u0404",KHcy:"\u0425",KJcy:"\u040C",Kappa:"\u039A",Kcedil:"\u0136",Kcy:"\u041A",Kfr:"\u{1D50E}",Kopf:"\u{1D542}",Kscr:"\u{1D4A6}",LJcy:"\u0409",LT:"<",Lacute:"\u0139",Lambda:"\u039B",Lang:"\u27EA",Laplacetrf:"\u2112",Larr:"\u219E",Lcaron:"\u013D",Lcedil:"\u013B",Lcy:"\u041B",LeftAngleBracket:"\u27E8",LeftArrow:"\u2190",LeftArrowBar:"\u21E4",LeftArrowRightArrow:"\u21C6",LeftCeiling:"\u2308",LeftDoubleBracket:"\u27E6",LeftDownTeeVector:"\u2961",LeftDownVector:"\u21C3",LeftDownVectorBar:"\u2959",LeftFloor:"\u230A",LeftRightArrow:"\u2194",LeftRightVector:"\u294E",LeftTee:"\u22A3",LeftTeeArrow:"\u21A4",LeftTeeVector:"\u295A",LeftTriangle:"\u22B2",LeftTriangleBar:"\u29CF",LeftTriangleEqual:"\u22B4",LeftUpDownVector:"\u2951",LeftUpTeeVector:"\u2960",LeftUpVector:"\u21BF",LeftUpVectorBar:"\u2958",LeftVector:"\u21BC",LeftVectorBar:"\u2952",Leftarrow:"\u21D0",Leftrightarrow:"\u21D4",LessEqualGreater:"\u22DA",LessFullEqual:"\u2266",LessGreater:"\u2276",LessLess:"\u2AA1",LessSlantEqual:"\u2A7D",LessTilde:"\u2272",Lfr:"\u{1D50F}",Ll:"\u22D8",Lleftarrow:"\u21DA",Lmidot:"\u013F",LongLeftArrow:"\u27F5",LongLeftRightArrow:"\u27F7",LongRightArrow:"\u27F6",Longleftarrow:"\u27F8",Longleftrightarrow:"\u27FA",Longrightarrow:"\u27F9",Lopf:"\u{1D543}",LowerLeftArrow:"\u2199",LowerRightArrow:"\u2198",Lscr:"\u2112",Lsh:"\u21B0",Lstrok:"\u0141",Lt:"\u226A",Map:"\u2905",Mcy:"\u041C",MediumSpace:"\u205F",Mellintrf:"\u2133",Mfr:"\u{1D510}",MinusPlus:"\u2213",Mopf:"\u{1D544}",Mscr:"\u2133",Mu:"\u039C",NJcy:"\u040A",Nacute:"\u0143",Ncaron:"\u0147",Ncedil:"\u0145",Ncy:"\u041D",NegativeMediumSpace:"\u200B",NegativeThickSpace:"\u200B",NegativeThinSpace:"\u200B",NegativeVeryThinSpace:"\u200B",NestedGreaterGreater:"\u226B",NestedLessLess:"\u226A",NewLine:`
`,Nfr:"\u{1D511}",NoBreak:"\u2060",NonBreakingSpace:"\xA0",Nopf:"\u2115",Not:"\u2AEC",NotCongruent:"\u2262",NotCupCap:"\u226D",NotDoubleVerticalBar:"\u2226",NotElement:"\u2209",NotEqual:"\u2260",NotEqualTilde:"\u2242\u0338",NotExists:"\u2204",NotGreater:"\u226F",NotGreaterEqual:"\u2271",NotGreaterFullEqual:"\u2267\u0338",NotGreaterGreater:"\u226B\u0338",NotGreaterLess:"\u2279",NotGreaterSlantEqual:"\u2A7E\u0338",NotGreaterTilde:"\u2275",NotHumpDownHump:"\u224E\u0338",NotHumpEqual:"\u224F\u0338",NotLeftTriangle:"\u22EA",NotLeftTriangleBar:"\u29CF\u0338",NotLeftTriangleEqual:"\u22EC",NotLess:"\u226E",NotLessEqual:"\u2270",NotLessGreater:"\u2278",NotLessLess:"\u226A\u0338",NotLessSlantEqual:"\u2A7D\u0338",NotLessTilde:"\u2274",NotNestedGreaterGreater:"\u2AA2\u0338",NotNestedLessLess:"\u2AA1\u0338",NotPrecedes:"\u2280",NotPrecedesEqual:"\u2AAF\u0338",NotPrecedesSlantEqual:"\u22E0",NotReverseElement:"\u220C",NotRightTriangle:"\u22EB",NotRightTriangleBar:"\u29D0\u0338",NotRightTriangleEqual:"\u22ED",NotSquareSubset:"\u228F\u0338",NotSquareSubsetEqual:"\u22E2",NotSquareSuperset:"\u2290\u0338",NotSquareSupersetEqual:"\u22E3",NotSubset:"\u2282\u20D2",NotSubsetEqual:"\u2288",NotSucceeds:"\u2281",NotSucceedsEqual:"\u2AB0\u0338",NotSucceedsSlantEqual:"\u22E1",NotSucceedsTilde:"\u227F\u0338",NotSuperset:"\u2283\u20D2",NotSupersetEqual:"\u2289",NotTilde:"\u2241",NotTildeEqual:"\u2244",NotTildeFullEqual:"\u2247",NotTildeTilde:"\u2249",NotVerticalBar:"\u2224",Nscr:"\u{1D4A9}",Ntilde:"\xD1",Nu:"\u039D",OElig:"\u0152",Oacute:"\xD3",Ocirc:"\xD4",Ocy:"\u041E",Odblac:"\u0150",Ofr:"\u{1D512}",Ograve:"\xD2",Omacr:"\u014C",Omega:"\u03A9",Omicron:"\u039F",Oopf:"\u{1D546}",OpenCurlyDoubleQuote:"\u201C",OpenCurlyQuote:"\u2018",Or:"\u2A54",Oscr:"\u{1D4AA}",Oslash:"\xD8",Otilde:"\xD5",Otimes:"\u2A37",Ouml:"\xD6",OverBar:"\u203E",OverBrace:"\u23DE",OverBracket:"\u23B4",OverParenthesis:"\u23DC",PartialD:"\u2202",Pcy:"\u041F",Pfr:"\u{1D513}",Phi:"\u03A6",Pi:"\u03A0",PlusMinus:"\xB1",Poincareplane:"\u210C",Popf:"\u2119",Pr:"\u2ABB",Precedes:"\u227A",PrecedesEqual:"\u2AAF",PrecedesSlantEqual:"\u227C",PrecedesTilde:"\u227E",Prime:"\u2033",Product:"\u220F",Proportion:"\u2237",Proportional:"\u221D",Pscr:"\u{1D4AB}",Psi:"\u03A8",QUOT:'"',Qfr:"\u{1D514}",Qopf:"\u211A",Qscr:"\u{1D4AC}",RBarr:"\u2910",REG:"\xAE",Racute:"\u0154",Rang:"\u27EB",Rarr:"\u21A0",Rarrtl:"\u2916",Rcaron:"\u0158",Rcedil:"\u0156",Rcy:"\u0420",Re:"\u211C",ReverseElement:"\u220B",ReverseEquilibrium:"\u21CB",ReverseUpEquilibrium:"\u296F",Rfr:"\u211C",Rho:"\u03A1",RightAngleBracket:"\u27E9",RightArrow:"\u2192",RightArrowBar:"\u21E5",RightArrowLeftArrow:"\u21C4",RightCeiling:"\u2309",RightDoubleBracket:"\u27E7",RightDownTeeVector:"\u295D",RightDownVector:"\u21C2",RightDownVectorBar:"\u2955",RightFloor:"\u230B",RightTee:"\u22A2",RightTeeArrow:"\u21A6",RightTeeVector:"\u295B",RightTriangle:"\u22B3",RightTriangleBar:"\u29D0",RightTriangleEqual:"\u22B5",RightUpDownVector:"\u294F",RightUpTeeVector:"\u295C",RightUpVector:"\u21BE",RightUpVectorBar:"\u2954",RightVector:"\u21C0",RightVectorBar:"\u2953",Rightarrow:"\u21D2",Ropf:"\u211D",RoundImplies:"\u2970",Rrightarrow:"\u21DB",Rscr:"\u211B",Rsh:"\u21B1",RuleDelayed:"\u29F4",SHCHcy:"\u0429",SHcy:"\u0428",SOFTcy:"\u042C",Sacute:"\u015A",Sc:"\u2ABC",Scaron:"\u0160",Scedil:"\u015E",Scirc:"\u015C",Scy:"\u0421",Sfr:"\u{1D516}",ShortDownArrow:"\u2193",ShortLeftArrow:"\u2190",ShortRightArrow:"\u2192",ShortUpArrow:"\u2191",Sigma:"\u03A3",SmallCircle:"\u2218",Sopf:"\u{1D54A}",Sqrt:"\u221A",Square:"\u25A1",SquareIntersection:"\u2293",SquareSubset:"\u228F",SquareSubsetEqual:"\u2291",SquareSuperset:"\u2290",SquareSupersetEqual:"\u2292",SquareUnion:"\u2294",Sscr:"\u{1D4AE}",Star:"\u22C6",Sub:"\u22D0",Subset:"\u22D0",SubsetEqual:"\u2286",Succeeds:"\u227B",SucceedsEqual:"\u2AB0",SucceedsSlantEqual:"\u227D",SucceedsTilde:"\u227F",SuchThat:"\u220B",Sum:"\u2211",Sup:"\u22D1",Superset:"\u2283",SupersetEqual:"\u2287",Supset:"\u22D1",THORN:"\xDE",TRADE:"\u2122",TSHcy:"\u040B",TScy:"\u0426",Tab:"	",Tau:"\u03A4",Tcaron:"\u0164",Tcedil:"\u0162",Tcy:"\u0422",Tfr:"\u{1D517}",Therefore:"\u2234",Theta:"\u0398",ThickSpace:"\u205F\u200A",ThinSpace:"\u2009",Tilde:"\u223C",TildeEqual:"\u2243",TildeFullEqual:"\u2245",TildeTilde:"\u2248",Topf:"\u{1D54B}",TripleDot:"\u20DB",Tscr:"\u{1D4AF}",Tstrok:"\u0166",Uacute:"\xDA",Uarr:"\u219F",Uarrocir:"\u2949",Ubrcy:"\u040E",Ubreve:"\u016C",Ucirc:"\xDB",Ucy:"\u0423",Udblac:"\u0170",Ufr:"\u{1D518}",Ugrave:"\xD9",Umacr:"\u016A",UnderBar:"_",UnderBrace:"\u23DF",UnderBracket:"\u23B5",UnderParenthesis:"\u23DD",Union:"\u22C3",UnionPlus:"\u228E",Uogon:"\u0172",Uopf:"\u{1D54C}",UpArrow:"\u2191",UpArrowBar:"\u2912",UpArrowDownArrow:"\u21C5",UpDownArrow:"\u2195",UpEquilibrium:"\u296E",UpTee:"\u22A5",UpTeeArrow:"\u21A5",Uparrow:"\u21D1",Updownarrow:"\u21D5",UpperLeftArrow:"\u2196",UpperRightArrow:"\u2197",Upsi:"\u03D2",Upsilon:"\u03A5",Uring:"\u016E",Uscr:"\u{1D4B0}",Utilde:"\u0168",Uuml:"\xDC",VDash:"\u22AB",Vbar:"\u2AEB",Vcy:"\u0412",Vdash:"\u22A9",Vdashl:"\u2AE6",Vee:"\u22C1",Verbar:"\u2016",Vert:"\u2016",VerticalBar:"\u2223",VerticalLine:"|",VerticalSeparator:"\u2758",VerticalTilde:"\u2240",VeryThinSpace:"\u200A",Vfr:"\u{1D519}",Vopf:"\u{1D54D}",Vscr:"\u{1D4B1}",Vvdash:"\u22AA",Wcirc:"\u0174",Wedge:"\u22C0",Wfr:"\u{1D51A}",Wopf:"\u{1D54E}",Wscr:"\u{1D4B2}",Xfr:"\u{1D51B}",Xi:"\u039E",Xopf:"\u{1D54F}",Xscr:"\u{1D4B3}",YAcy:"\u042F",YIcy:"\u0407",YUcy:"\u042E",Yacute:"\xDD",Ycirc:"\u0176",Ycy:"\u042B",Yfr:"\u{1D51C}",Yopf:"\u{1D550}",Yscr:"\u{1D4B4}",Yuml:"\u0178",ZHcy:"\u0416",Zacute:"\u0179",Zcaron:"\u017D",Zcy:"\u0417",Zdot:"\u017B",ZeroWidthSpace:"\u200B",Zeta:"\u0396",Zfr:"\u2128",Zopf:"\u2124",Zscr:"\u{1D4B5}",aacute:"\xE1",abreve:"\u0103",ac:"\u223E",acE:"\u223E\u0333",acd:"\u223F",acirc:"\xE2",acute:"\xB4",acy:"\u0430",aelig:"\xE6",af:"\u2061",afr:"\u{1D51E}",agrave:"\xE0",alefsym:"\u2135",aleph:"\u2135",alpha:"\u03B1",amacr:"\u0101",amalg:"\u2A3F",amp:"&",and:"\u2227",andand:"\u2A55",andd:"\u2A5C",andslope:"\u2A58",andv:"\u2A5A",ang:"\u2220",ange:"\u29A4",angle:"\u2220",angmsd:"\u2221",angmsdaa:"\u29A8",angmsdab:"\u29A9",angmsdac:"\u29AA",angmsdad:"\u29AB",angmsdae:"\u29AC",angmsdaf:"\u29AD",angmsdag:"\u29AE",angmsdah:"\u29AF",angrt:"\u221F",angrtvb:"\u22BE",angrtvbd:"\u299D",angsph:"\u2222",angst:"\xC5",angzarr:"\u237C",aogon:"\u0105",aopf:"\u{1D552}",ap:"\u2248",apE:"\u2A70",apacir:"\u2A6F",ape:"\u224A",apid:"\u224B",apos:"'",approx:"\u2248",approxeq:"\u224A",aring:"\xE5",ascr:"\u{1D4B6}",ast:"*",asymp:"\u2248",asympeq:"\u224D",atilde:"\xE3",auml:"\xE4",awconint:"\u2233",awint:"\u2A11",bNot:"\u2AED",backcong:"\u224C",backepsilon:"\u03F6",backprime:"\u2035",backsim:"\u223D",backsimeq:"\u22CD",barvee:"\u22BD",barwed:"\u2305",barwedge:"\u2305",bbrk:"\u23B5",bbrktbrk:"\u23B6",bcong:"\u224C",bcy:"\u0431",bdquo:"\u201E",becaus:"\u2235",because:"\u2235",bemptyv:"\u29B0",bepsi:"\u03F6",bernou:"\u212C",beta:"\u03B2",beth:"\u2136",between:"\u226C",bfr:"\u{1D51F}",bigcap:"\u22C2",bigcirc:"\u25EF",bigcup:"\u22C3",bigodot:"\u2A00",bigoplus:"\u2A01",bigotimes:"\u2A02",bigsqcup:"\u2A06",bigstar:"\u2605",bigtriangledown:"\u25BD",bigtriangleup:"\u25B3",biguplus:"\u2A04",bigvee:"\u22C1",bigwedge:"\u22C0",bkarow:"\u290D",blacklozenge:"\u29EB",blacksquare:"\u25AA",blacktriangle:"\u25B4",blacktriangledown:"\u25BE",blacktriangleleft:"\u25C2",blacktriangleright:"\u25B8",blank:"\u2423",blk12:"\u2592",blk14:"\u2591",blk34:"\u2593",block:"\u2588",bne:"=\u20E5",bnequiv:"\u2261\u20E5",bnot:"\u2310",bopf:"\u{1D553}",bot:"\u22A5",bottom:"\u22A5",bowtie:"\u22C8",boxDL:"\u2557",boxDR:"\u2554",boxDl:"\u2556",boxDr:"\u2553",boxH:"\u2550",boxHD:"\u2566",boxHU:"\u2569",boxHd:"\u2564",boxHu:"\u2567",boxUL:"\u255D",boxUR:"\u255A",boxUl:"\u255C",boxUr:"\u2559",boxV:"\u2551",boxVH:"\u256C",boxVL:"\u2563",boxVR:"\u2560",boxVh:"\u256B",boxVl:"\u2562",boxVr:"\u255F",boxbox:"\u29C9",boxdL:"\u2555",boxdR:"\u2552",boxdl:"\u2510",boxdr:"\u250C",boxh:"\u2500",boxhD:"\u2565",boxhU:"\u2568",boxhd:"\u252C",boxhu:"\u2534",boxminus:"\u229F",boxplus:"\u229E",boxtimes:"\u22A0",boxuL:"\u255B",boxuR:"\u2558",boxul:"\u2518",boxur:"\u2514",boxv:"\u2502",boxvH:"\u256A",boxvL:"\u2561",boxvR:"\u255E",boxvh:"\u253C",boxvl:"\u2524",boxvr:"\u251C",bprime:"\u2035",breve:"\u02D8",brvbar:"\xA6",bscr:"\u{1D4B7}",bsemi:"\u204F",bsim:"\u223D",bsime:"\u22CD",bsol:"\\",bsolb:"\u29C5",bsolhsub:"\u27C8",bull:"\u2022",bullet:"\u2022",bump:"\u224E",bumpE:"\u2AAE",bumpe:"\u224F",bumpeq:"\u224F",cacute:"\u0107",cap:"\u2229",capand:"\u2A44",capbrcup:"\u2A49",capcap:"\u2A4B",capcup:"\u2A47",capdot:"\u2A40",caps:"\u2229\uFE00",caret:"\u2041",caron:"\u02C7",ccaps:"\u2A4D",ccaron:"\u010D",ccedil:"\xE7",ccirc:"\u0109",ccups:"\u2A4C",ccupssm:"\u2A50",cdot:"\u010B",cedil:"\xB8",cemptyv:"\u29B2",cent:"\xA2",centerdot:"\xB7",cfr:"\u{1D520}",chcy:"\u0447",check:"\u2713",checkmark:"\u2713",chi:"\u03C7",cir:"\u25CB",cirE:"\u29C3",circ:"\u02C6",circeq:"\u2257",circlearrowleft:"\u21BA",circlearrowright:"\u21BB",circledR:"\xAE",circledS:"\u24C8",circledast:"\u229B",circledcirc:"\u229A",circleddash:"\u229D",cire:"\u2257",cirfnint:"\u2A10",cirmid:"\u2AEF",cirscir:"\u29C2",clubs:"\u2663",clubsuit:"\u2663",colon:":",colone:"\u2254",coloneq:"\u2254",comma:",",commat:"@",comp:"\u2201",compfn:"\u2218",complement:"\u2201",complexes:"\u2102",cong:"\u2245",congdot:"\u2A6D",conint:"\u222E",copf:"\u{1D554}",coprod:"\u2210",copy:"\xA9",copysr:"\u2117",crarr:"\u21B5",cross:"\u2717",cscr:"\u{1D4B8}",csub:"\u2ACF",csube:"\u2AD1",csup:"\u2AD0",csupe:"\u2AD2",ctdot:"\u22EF",cudarrl:"\u2938",cudarrr:"\u2935",cuepr:"\u22DE",cuesc:"\u22DF",cularr:"\u21B6",cularrp:"\u293D",cup:"\u222A",cupbrcap:"\u2A48",cupcap:"\u2A46",cupcup:"\u2A4A",cupdot:"\u228D",cupor:"\u2A45",cups:"\u222A\uFE00",curarr:"\u21B7",curarrm:"\u293C",curlyeqprec:"\u22DE",curlyeqsucc:"\u22DF",curlyvee:"\u22CE",curlywedge:"\u22CF",curren:"\xA4",curvearrowleft:"\u21B6",curvearrowright:"\u21B7",cuvee:"\u22CE",cuwed:"\u22CF",cwconint:"\u2232",cwint:"\u2231",cylcty:"\u232D",dArr:"\u21D3",dHar:"\u2965",dagger:"\u2020",daleth:"\u2138",darr:"\u2193",dash:"\u2010",dashv:"\u22A3",dbkarow:"\u290F",dblac:"\u02DD",dcaron:"\u010F",dcy:"\u0434",dd:"\u2146",ddagger:"\u2021",ddarr:"\u21CA",ddotseq:"\u2A77",deg:"\xB0",delta:"\u03B4",demptyv:"\u29B1",dfisht:"\u297F",dfr:"\u{1D521}",dharl:"\u21C3",dharr:"\u21C2",diam:"\u22C4",diamond:"\u22C4",diamondsuit:"\u2666",diams:"\u2666",die:"\xA8",digamma:"\u03DD",disin:"\u22F2",div:"\xF7",divide:"\xF7",divideontimes:"\u22C7",divonx:"\u22C7",djcy:"\u0452",dlcorn:"\u231E",dlcrop:"\u230D",dollar:"$",dopf:"\u{1D555}",dot:"\u02D9",doteq:"\u2250",doteqdot:"\u2251",dotminus:"\u2238",dotplus:"\u2214",dotsquare:"\u22A1",doublebarwedge:"\u2306",downarrow:"\u2193",downdownarrows:"\u21CA",downharpoonleft:"\u21C3",downharpoonright:"\u21C2",drbkarow:"\u2910",drcorn:"\u231F",drcrop:"\u230C",dscr:"\u{1D4B9}",dscy:"\u0455",dsol:"\u29F6",dstrok:"\u0111",dtdot:"\u22F1",dtri:"\u25BF",dtrif:"\u25BE",duarr:"\u21F5",duhar:"\u296F",dwangle:"\u29A6",dzcy:"\u045F",dzigrarr:"\u27FF",eDDot:"\u2A77",eDot:"\u2251",eacute:"\xE9",easter:"\u2A6E",ecaron:"\u011B",ecir:"\u2256",ecirc:"\xEA",ecolon:"\u2255",ecy:"\u044D",edot:"\u0117",ee:"\u2147",efDot:"\u2252",efr:"\u{1D522}",eg:"\u2A9A",egrave:"\xE8",egs:"\u2A96",egsdot:"\u2A98",el:"\u2A99",elinters:"\u23E7",ell:"\u2113",els:"\u2A95",elsdot:"\u2A97",emacr:"\u0113",empty:"\u2205",emptyset:"\u2205",emptyv:"\u2205",emsp13:"\u2004",emsp14:"\u2005",emsp:"\u2003",eng:"\u014B",ensp:"\u2002",eogon:"\u0119",eopf:"\u{1D556}",epar:"\u22D5",eparsl:"\u29E3",eplus:"\u2A71",epsi:"\u03B5",epsilon:"\u03B5",epsiv:"\u03F5",eqcirc:"\u2256",eqcolon:"\u2255",eqsim:"\u2242",eqslantgtr:"\u2A96",eqslantless:"\u2A95",equals:"=",equest:"\u225F",equiv:"\u2261",equivDD:"\u2A78",eqvparsl:"\u29E5",erDot:"\u2253",erarr:"\u2971",escr:"\u212F",esdot:"\u2250",esim:"\u2242",eta:"\u03B7",eth:"\xF0",euml:"\xEB",euro:"\u20AC",excl:"!",exist:"\u2203",expectation:"\u2130",exponentiale:"\u2147",fallingdotseq:"\u2252",fcy:"\u0444",female:"\u2640",ffilig:"\uFB03",fflig:"\uFB00",ffllig:"\uFB04",ffr:"\u{1D523}",filig:"\uFB01",fjlig:"fj",flat:"\u266D",fllig:"\uFB02",fltns:"\u25B1",fnof:"\u0192",fopf:"\u{1D557}",forall:"\u2200",fork:"\u22D4",forkv:"\u2AD9",fpartint:"\u2A0D",frac12:"\xBD",frac13:"\u2153",frac14:"\xBC",frac15:"\u2155",frac16:"\u2159",frac18:"\u215B",frac23:"\u2154",frac25:"\u2156",frac34:"\xBE",frac35:"\u2157",frac38:"\u215C",frac45:"\u2158",frac56:"\u215A",frac58:"\u215D",frac78:"\u215E",frasl:"\u2044",frown:"\u2322",fscr:"\u{1D4BB}",gE:"\u2267",gEl:"\u2A8C",gacute:"\u01F5",gamma:"\u03B3",gammad:"\u03DD",gap:"\u2A86",gbreve:"\u011F",gcirc:"\u011D",gcy:"\u0433",gdot:"\u0121",ge:"\u2265",gel:"\u22DB",geq:"\u2265",geqq:"\u2267",geqslant:"\u2A7E",ges:"\u2A7E",gescc:"\u2AA9",gesdot:"\u2A80",gesdoto:"\u2A82",gesdotol:"\u2A84",gesl:"\u22DB\uFE00",gesles:"\u2A94",gfr:"\u{1D524}",gg:"\u226B",ggg:"\u22D9",gimel:"\u2137",gjcy:"\u0453",gl:"\u2277",glE:"\u2A92",gla:"\u2AA5",glj:"\u2AA4",gnE:"\u2269",gnap:"\u2A8A",gnapprox:"\u2A8A",gne:"\u2A88",gneq:"\u2A88",gneqq:"\u2269",gnsim:"\u22E7",gopf:"\u{1D558}",grave:"`",gscr:"\u210A",gsim:"\u2273",gsime:"\u2A8E",gsiml:"\u2A90",gt:">",gtcc:"\u2AA7",gtcir:"\u2A7A",gtdot:"\u22D7",gtlPar:"\u2995",gtquest:"\u2A7C",gtrapprox:"\u2A86",gtrarr:"\u2978",gtrdot:"\u22D7",gtreqless:"\u22DB",gtreqqless:"\u2A8C",gtrless:"\u2277",gtrsim:"\u2273",gvertneqq:"\u2269\uFE00",gvnE:"\u2269\uFE00",hArr:"\u21D4",hairsp:"\u200A",half:"\xBD",hamilt:"\u210B",hardcy:"\u044A",harr:"\u2194",harrcir:"\u2948",harrw:"\u21AD",hbar:"\u210F",hcirc:"\u0125",hearts:"\u2665",heartsuit:"\u2665",hellip:"\u2026",hercon:"\u22B9",hfr:"\u{1D525}",hksearow:"\u2925",hkswarow:"\u2926",hoarr:"\u21FF",homtht:"\u223B",hookleftarrow:"\u21A9",hookrightarrow:"\u21AA",hopf:"\u{1D559}",horbar:"\u2015",hscr:"\u{1D4BD}",hslash:"\u210F",hstrok:"\u0127",hybull:"\u2043",hyphen:"\u2010",iacute:"\xED",ic:"\u2063",icirc:"\xEE",icy:"\u0438",iecy:"\u0435",iexcl:"\xA1",iff:"\u21D4",ifr:"\u{1D526}",igrave:"\xEC",ii:"\u2148",iiiint:"\u2A0C",iiint:"\u222D",iinfin:"\u29DC",iiota:"\u2129",ijlig:"\u0133",imacr:"\u012B",image:"\u2111",imagline:"\u2110",imagpart:"\u2111",imath:"\u0131",imof:"\u22B7",imped:"\u01B5",in:"\u2208",incare:"\u2105",infin:"\u221E",infintie:"\u29DD",inodot:"\u0131",int:"\u222B",intcal:"\u22BA",integers:"\u2124",intercal:"\u22BA",intlarhk:"\u2A17",intprod:"\u2A3C",iocy:"\u0451",iogon:"\u012F",iopf:"\u{1D55A}",iota:"\u03B9",iprod:"\u2A3C",iquest:"\xBF",iscr:"\u{1D4BE}",isin:"\u2208",isinE:"\u22F9",isindot:"\u22F5",isins:"\u22F4",isinsv:"\u22F3",isinv:"\u2208",it:"\u2062",itilde:"\u0129",iukcy:"\u0456",iuml:"\xEF",jcirc:"\u0135",jcy:"\u0439",jfr:"\u{1D527}",jmath:"\u0237",jopf:"\u{1D55B}",jscr:"\u{1D4BF}",jsercy:"\u0458",jukcy:"\u0454",kappa:"\u03BA",kappav:"\u03F0",kcedil:"\u0137",kcy:"\u043A",kfr:"\u{1D528}",kgreen:"\u0138",khcy:"\u0445",kjcy:"\u045C",kopf:"\u{1D55C}",kscr:"\u{1D4C0}",lAarr:"\u21DA",lArr:"\u21D0",lAtail:"\u291B",lBarr:"\u290E",lE:"\u2266",lEg:"\u2A8B",lHar:"\u2962",lacute:"\u013A",laemptyv:"\u29B4",lagran:"\u2112",lambda:"\u03BB",lang:"\u27E8",langd:"\u2991",langle:"\u27E8",lap:"\u2A85",laquo:"\xAB",larr:"\u2190",larrb:"\u21E4",larrbfs:"\u291F",larrfs:"\u291D",larrhk:"\u21A9",larrlp:"\u21AB",larrpl:"\u2939",larrsim:"\u2973",larrtl:"\u21A2",lat:"\u2AAB",latail:"\u2919",late:"\u2AAD",lates:"\u2AAD\uFE00",lbarr:"\u290C",lbbrk:"\u2772",lbrace:"{",lbrack:"[",lbrke:"\u298B",lbrksld:"\u298F",lbrkslu:"\u298D",lcaron:"\u013E",lcedil:"\u013C",lceil:"\u2308",lcub:"{",lcy:"\u043B",ldca:"\u2936",ldquo:"\u201C",ldquor:"\u201E",ldrdhar:"\u2967",ldrushar:"\u294B",ldsh:"\u21B2",le:"\u2264",leftarrow:"\u2190",leftarrowtail:"\u21A2",leftharpoondown:"\u21BD",leftharpoonup:"\u21BC",leftleftarrows:"\u21C7",leftrightarrow:"\u2194",leftrightarrows:"\u21C6",leftrightharpoons:"\u21CB",leftrightsquigarrow:"\u21AD",leftthreetimes:"\u22CB",leg:"\u22DA",leq:"\u2264",leqq:"\u2266",leqslant:"\u2A7D",les:"\u2A7D",lescc:"\u2AA8",lesdot:"\u2A7F",lesdoto:"\u2A81",lesdotor:"\u2A83",lesg:"\u22DA\uFE00",lesges:"\u2A93",lessapprox:"\u2A85",lessdot:"\u22D6",lesseqgtr:"\u22DA",lesseqqgtr:"\u2A8B",lessgtr:"\u2276",lesssim:"\u2272",lfisht:"\u297C",lfloor:"\u230A",lfr:"\u{1D529}",lg:"\u2276",lgE:"\u2A91",lhard:"\u21BD",lharu:"\u21BC",lharul:"\u296A",lhblk:"\u2584",ljcy:"\u0459",ll:"\u226A",llarr:"\u21C7",llcorner:"\u231E",llhard:"\u296B",lltri:"\u25FA",lmidot:"\u0140",lmoust:"\u23B0",lmoustache:"\u23B0",lnE:"\u2268",lnap:"\u2A89",lnapprox:"\u2A89",lne:"\u2A87",lneq:"\u2A87",lneqq:"\u2268",lnsim:"\u22E6",loang:"\u27EC",loarr:"\u21FD",lobrk:"\u27E6",longleftarrow:"\u27F5",longleftrightarrow:"\u27F7",longmapsto:"\u27FC",longrightarrow:"\u27F6",looparrowleft:"\u21AB",looparrowright:"\u21AC",lopar:"\u2985",lopf:"\u{1D55D}",loplus:"\u2A2D",lotimes:"\u2A34",lowast:"\u2217",lowbar:"_",loz:"\u25CA",lozenge:"\u25CA",lozf:"\u29EB",lpar:"(",lparlt:"\u2993",lrarr:"\u21C6",lrcorner:"\u231F",lrhar:"\u21CB",lrhard:"\u296D",lrm:"\u200E",lrtri:"\u22BF",lsaquo:"\u2039",lscr:"\u{1D4C1}",lsh:"\u21B0",lsim:"\u2272",lsime:"\u2A8D",lsimg:"\u2A8F",lsqb:"[",lsquo:"\u2018",lsquor:"\u201A",lstrok:"\u0142",lt:"<",ltcc:"\u2AA6",ltcir:"\u2A79",ltdot:"\u22D6",lthree:"\u22CB",ltimes:"\u22C9",ltlarr:"\u2976",ltquest:"\u2A7B",ltrPar:"\u2996",ltri:"\u25C3",ltrie:"\u22B4",ltrif:"\u25C2",lurdshar:"\u294A",luruhar:"\u2966",lvertneqq:"\u2268\uFE00",lvnE:"\u2268\uFE00",mDDot:"\u223A",macr:"\xAF",male:"\u2642",malt:"\u2720",maltese:"\u2720",map:"\u21A6",mapsto:"\u21A6",mapstodown:"\u21A7",mapstoleft:"\u21A4",mapstoup:"\u21A5",marker:"\u25AE",mcomma:"\u2A29",mcy:"\u043C",mdash:"\u2014",measuredangle:"\u2221",mfr:"\u{1D52A}",mho:"\u2127",micro:"\xB5",mid:"\u2223",midast:"*",midcir:"\u2AF0",middot:"\xB7",minus:"\u2212",minusb:"\u229F",minusd:"\u2238",minusdu:"\u2A2A",mlcp:"\u2ADB",mldr:"\u2026",mnplus:"\u2213",models:"\u22A7",mopf:"\u{1D55E}",mp:"\u2213",mscr:"\u{1D4C2}",mstpos:"\u223E",mu:"\u03BC",multimap:"\u22B8",mumap:"\u22B8",nGg:"\u22D9\u0338",nGt:"\u226B\u20D2",nGtv:"\u226B\u0338",nLeftarrow:"\u21CD",nLeftrightarrow:"\u21CE",nLl:"\u22D8\u0338",nLt:"\u226A\u20D2",nLtv:"\u226A\u0338",nRightarrow:"\u21CF",nVDash:"\u22AF",nVdash:"\u22AE",nabla:"\u2207",nacute:"\u0144",nang:"\u2220\u20D2",nap:"\u2249",napE:"\u2A70\u0338",napid:"\u224B\u0338",napos:"\u0149",napprox:"\u2249",natur:"\u266E",natural:"\u266E",naturals:"\u2115",nbsp:"\xA0",nbump:"\u224E\u0338",nbumpe:"\u224F\u0338",ncap:"\u2A43",ncaron:"\u0148",ncedil:"\u0146",ncong:"\u2247",ncongdot:"\u2A6D\u0338",ncup:"\u2A42",ncy:"\u043D",ndash:"\u2013",ne:"\u2260",neArr:"\u21D7",nearhk:"\u2924",nearr:"\u2197",nearrow:"\u2197",nedot:"\u2250\u0338",nequiv:"\u2262",nesear:"\u2928",nesim:"\u2242\u0338",nexist:"\u2204",nexists:"\u2204",nfr:"\u{1D52B}",ngE:"\u2267\u0338",nge:"\u2271",ngeq:"\u2271",ngeqq:"\u2267\u0338",ngeqslant:"\u2A7E\u0338",nges:"\u2A7E\u0338",ngsim:"\u2275",ngt:"\u226F",ngtr:"\u226F",nhArr:"\u21CE",nharr:"\u21AE",nhpar:"\u2AF2",ni:"\u220B",nis:"\u22FC",nisd:"\u22FA",niv:"\u220B",njcy:"\u045A",nlArr:"\u21CD",nlE:"\u2266\u0338",nlarr:"\u219A",nldr:"\u2025",nle:"\u2270",nleftarrow:"\u219A",nleftrightarrow:"\u21AE",nleq:"\u2270",nleqq:"\u2266\u0338",nleqslant:"\u2A7D\u0338",nles:"\u2A7D\u0338",nless:"\u226E",nlsim:"\u2274",nlt:"\u226E",nltri:"\u22EA",nltrie:"\u22EC",nmid:"\u2224",nopf:"\u{1D55F}",not:"\xAC",notin:"\u2209",notinE:"\u22F9\u0338",notindot:"\u22F5\u0338",notinva:"\u2209",notinvb:"\u22F7",notinvc:"\u22F6",notni:"\u220C",notniva:"\u220C",notnivb:"\u22FE",notnivc:"\u22FD",npar:"\u2226",nparallel:"\u2226",nparsl:"\u2AFD\u20E5",npart:"\u2202\u0338",npolint:"\u2A14",npr:"\u2280",nprcue:"\u22E0",npre:"\u2AAF\u0338",nprec:"\u2280",npreceq:"\u2AAF\u0338",nrArr:"\u21CF",nrarr:"\u219B",nrarrc:"\u2933\u0338",nrarrw:"\u219D\u0338",nrightarrow:"\u219B",nrtri:"\u22EB",nrtrie:"\u22ED",nsc:"\u2281",nsccue:"\u22E1",nsce:"\u2AB0\u0338",nscr:"\u{1D4C3}",nshortmid:"\u2224",nshortparallel:"\u2226",nsim:"\u2241",nsime:"\u2244",nsimeq:"\u2244",nsmid:"\u2224",nspar:"\u2226",nsqsube:"\u22E2",nsqsupe:"\u22E3",nsub:"\u2284",nsubE:"\u2AC5\u0338",nsube:"\u2288",nsubset:"\u2282\u20D2",nsubseteq:"\u2288",nsubseteqq:"\u2AC5\u0338",nsucc:"\u2281",nsucceq:"\u2AB0\u0338",nsup:"\u2285",nsupE:"\u2AC6\u0338",nsupe:"\u2289",nsupset:"\u2283\u20D2",nsupseteq:"\u2289",nsupseteqq:"\u2AC6\u0338",ntgl:"\u2279",ntilde:"\xF1",ntlg:"\u2278",ntriangleleft:"\u22EA",ntrianglelefteq:"\u22EC",ntriangleright:"\u22EB",ntrianglerighteq:"\u22ED",nu:"\u03BD",num:"#",numero:"\u2116",numsp:"\u2007",nvDash:"\u22AD",nvHarr:"\u2904",nvap:"\u224D\u20D2",nvdash:"\u22AC",nvge:"\u2265\u20D2",nvgt:">\u20D2",nvinfin:"\u29DE",nvlArr:"\u2902",nvle:"\u2264\u20D2",nvlt:"<\u20D2",nvltrie:"\u22B4\u20D2",nvrArr:"\u2903",nvrtrie:"\u22B5\u20D2",nvsim:"\u223C\u20D2",nwArr:"\u21D6",nwarhk:"\u2923",nwarr:"\u2196",nwarrow:"\u2196",nwnear:"\u2927",oS:"\u24C8",oacute:"\xF3",oast:"\u229B",ocir:"\u229A",ocirc:"\xF4",ocy:"\u043E",odash:"\u229D",odblac:"\u0151",odiv:"\u2A38",odot:"\u2299",odsold:"\u29BC",oelig:"\u0153",ofcir:"\u29BF",ofr:"\u{1D52C}",ogon:"\u02DB",ograve:"\xF2",ogt:"\u29C1",ohbar:"\u29B5",ohm:"\u03A9",oint:"\u222E",olarr:"\u21BA",olcir:"\u29BE",olcross:"\u29BB",oline:"\u203E",olt:"\u29C0",omacr:"\u014D",omega:"\u03C9",omicron:"\u03BF",omid:"\u29B6",ominus:"\u2296",oopf:"\u{1D560}",opar:"\u29B7",operp:"\u29B9",oplus:"\u2295",or:"\u2228",orarr:"\u21BB",ord:"\u2A5D",order:"\u2134",orderof:"\u2134",ordf:"\xAA",ordm:"\xBA",origof:"\u22B6",oror:"\u2A56",orslope:"\u2A57",orv:"\u2A5B",oscr:"\u2134",oslash:"\xF8",osol:"\u2298",otilde:"\xF5",otimes:"\u2297",otimesas:"\u2A36",ouml:"\xF6",ovbar:"\u233D",par:"\u2225",para:"\xB6",parallel:"\u2225",parsim:"\u2AF3",parsl:"\u2AFD",part:"\u2202",pcy:"\u043F",percnt:"%",period:".",permil:"\u2030",perp:"\u22A5",pertenk:"\u2031",pfr:"\u{1D52D}",phi:"\u03C6",phiv:"\u03D5",phmmat:"\u2133",phone:"\u260E",pi:"\u03C0",pitchfork:"\u22D4",piv:"\u03D6",planck:"\u210F",planckh:"\u210E",plankv:"\u210F",plus:"+",plusacir:"\u2A23",plusb:"\u229E",pluscir:"\u2A22",plusdo:"\u2214",plusdu:"\u2A25",pluse:"\u2A72",plusmn:"\xB1",plussim:"\u2A26",plustwo:"\u2A27",pm:"\xB1",pointint:"\u2A15",popf:"\u{1D561}",pound:"\xA3",pr:"\u227A",prE:"\u2AB3",prap:"\u2AB7",prcue:"\u227C",pre:"\u2AAF",prec:"\u227A",precapprox:"\u2AB7",preccurlyeq:"\u227C",preceq:"\u2AAF",precnapprox:"\u2AB9",precneqq:"\u2AB5",precnsim:"\u22E8",precsim:"\u227E",prime:"\u2032",primes:"\u2119",prnE:"\u2AB5",prnap:"\u2AB9",prnsim:"\u22E8",prod:"\u220F",profalar:"\u232E",profline:"\u2312",profsurf:"\u2313",prop:"\u221D",propto:"\u221D",prsim:"\u227E",prurel:"\u22B0",pscr:"\u{1D4C5}",psi:"\u03C8",puncsp:"\u2008",qfr:"\u{1D52E}",qint:"\u2A0C",qopf:"\u{1D562}",qprime:"\u2057",qscr:"\u{1D4C6}",quaternions:"\u210D",quatint:"\u2A16",quest:"?",questeq:"\u225F",quot:'"',rAarr:"\u21DB",rArr:"\u21D2",rAtail:"\u291C",rBarr:"\u290F",rHar:"\u2964",race:"\u223D\u0331",racute:"\u0155",radic:"\u221A",raemptyv:"\u29B3",rang:"\u27E9",rangd:"\u2992",range:"\u29A5",rangle:"\u27E9",raquo:"\xBB",rarr:"\u2192",rarrap:"\u2975",rarrb:"\u21E5",rarrbfs:"\u2920",rarrc:"\u2933",rarrfs:"\u291E",rarrhk:"\u21AA",rarrlp:"\u21AC",rarrpl:"\u2945",rarrsim:"\u2974",rarrtl:"\u21A3",rarrw:"\u219D",ratail:"\u291A",ratio:"\u2236",rationals:"\u211A",rbarr:"\u290D",rbbrk:"\u2773",rbrace:"}",rbrack:"]",rbrke:"\u298C",rbrksld:"\u298E",rbrkslu:"\u2990",rcaron:"\u0159",rcedil:"\u0157",rceil:"\u2309",rcub:"}",rcy:"\u0440",rdca:"\u2937",rdldhar:"\u2969",rdquo:"\u201D",rdquor:"\u201D",rdsh:"\u21B3",real:"\u211C",realine:"\u211B",realpart:"\u211C",reals:"\u211D",rect:"\u25AD",reg:"\xAE",rfisht:"\u297D",rfloor:"\u230B",rfr:"\u{1D52F}",rhard:"\u21C1",rharu:"\u21C0",rharul:"\u296C",rho:"\u03C1",rhov:"\u03F1",rightarrow:"\u2192",rightarrowtail:"\u21A3",rightharpoondown:"\u21C1",rightharpoonup:"\u21C0",rightleftarrows:"\u21C4",rightleftharpoons:"\u21CC",rightrightarrows:"\u21C9",rightsquigarrow:"\u219D",rightthreetimes:"\u22CC",ring:"\u02DA",risingdotseq:"\u2253",rlarr:"\u21C4",rlhar:"\u21CC",rlm:"\u200F",rmoust:"\u23B1",rmoustache:"\u23B1",rnmid:"\u2AEE",roang:"\u27ED",roarr:"\u21FE",robrk:"\u27E7",ropar:"\u2986",ropf:"\u{1D563}",roplus:"\u2A2E",rotimes:"\u2A35",rpar:")",rpargt:"\u2994",rppolint:"\u2A12",rrarr:"\u21C9",rsaquo:"\u203A",rscr:"\u{1D4C7}",rsh:"\u21B1",rsqb:"]",rsquo:"\u2019",rsquor:"\u2019",rthree:"\u22CC",rtimes:"\u22CA",rtri:"\u25B9",rtrie:"\u22B5",rtrif:"\u25B8",rtriltri:"\u29CE",ruluhar:"\u2968",rx:"\u211E",sacute:"\u015B",sbquo:"\u201A",sc:"\u227B",scE:"\u2AB4",scap:"\u2AB8",scaron:"\u0161",sccue:"\u227D",sce:"\u2AB0",scedil:"\u015F",scirc:"\u015D",scnE:"\u2AB6",scnap:"\u2ABA",scnsim:"\u22E9",scpolint:"\u2A13",scsim:"\u227F",scy:"\u0441",sdot:"\u22C5",sdotb:"\u22A1",sdote:"\u2A66",seArr:"\u21D8",searhk:"\u2925",searr:"\u2198",searrow:"\u2198",sect:"\xA7",semi:";",seswar:"\u2929",setminus:"\u2216",setmn:"\u2216",sext:"\u2736",sfr:"\u{1D530}",sfrown:"\u2322",sharp:"\u266F",shchcy:"\u0449",shcy:"\u0448",shortmid:"\u2223",shortparallel:"\u2225",shy:"\xAD",sigma:"\u03C3",sigmaf:"\u03C2",sigmav:"\u03C2",sim:"\u223C",simdot:"\u2A6A",sime:"\u2243",simeq:"\u2243",simg:"\u2A9E",simgE:"\u2AA0",siml:"\u2A9D",simlE:"\u2A9F",simne:"\u2246",simplus:"\u2A24",simrarr:"\u2972",slarr:"\u2190",smallsetminus:"\u2216",smashp:"\u2A33",smeparsl:"\u29E4",smid:"\u2223",smile:"\u2323",smt:"\u2AAA",smte:"\u2AAC",smtes:"\u2AAC\uFE00",softcy:"\u044C",sol:"/",solb:"\u29C4",solbar:"\u233F",sopf:"\u{1D564}",spades:"\u2660",spadesuit:"\u2660",spar:"\u2225",sqcap:"\u2293",sqcaps:"\u2293\uFE00",sqcup:"\u2294",sqcups:"\u2294\uFE00",sqsub:"\u228F",sqsube:"\u2291",sqsubset:"\u228F",sqsubseteq:"\u2291",sqsup:"\u2290",sqsupe:"\u2292",sqsupset:"\u2290",sqsupseteq:"\u2292",squ:"\u25A1",square:"\u25A1",squarf:"\u25AA",squf:"\u25AA",srarr:"\u2192",sscr:"\u{1D4C8}",ssetmn:"\u2216",ssmile:"\u2323",sstarf:"\u22C6",star:"\u2606",starf:"\u2605",straightepsilon:"\u03F5",straightphi:"\u03D5",strns:"\xAF",sub:"\u2282",subE:"\u2AC5",subdot:"\u2ABD",sube:"\u2286",subedot:"\u2AC3",submult:"\u2AC1",subnE:"\u2ACB",subne:"\u228A",subplus:"\u2ABF",subrarr:"\u2979",subset:"\u2282",subseteq:"\u2286",subseteqq:"\u2AC5",subsetneq:"\u228A",subsetneqq:"\u2ACB",subsim:"\u2AC7",subsub:"\u2AD5",subsup:"\u2AD3",succ:"\u227B",succapprox:"\u2AB8",succcurlyeq:"\u227D",succeq:"\u2AB0",succnapprox:"\u2ABA",succneqq:"\u2AB6",succnsim:"\u22E9",succsim:"\u227F",sum:"\u2211",sung:"\u266A",sup1:"\xB9",sup2:"\xB2",sup3:"\xB3",sup:"\u2283",supE:"\u2AC6",supdot:"\u2ABE",supdsub:"\u2AD8",supe:"\u2287",supedot:"\u2AC4",suphsol:"\u27C9",suphsub:"\u2AD7",suplarr:"\u297B",supmult:"\u2AC2",supnE:"\u2ACC",supne:"\u228B",supplus:"\u2AC0",supset:"\u2283",supseteq:"\u2287",supseteqq:"\u2AC6",supsetneq:"\u228B",supsetneqq:"\u2ACC",supsim:"\u2AC8",supsub:"\u2AD4",supsup:"\u2AD6",swArr:"\u21D9",swarhk:"\u2926",swarr:"\u2199",swarrow:"\u2199",swnwar:"\u292A",szlig:"\xDF",target:"\u2316",tau:"\u03C4",tbrk:"\u23B4",tcaron:"\u0165",tcedil:"\u0163",tcy:"\u0442",tdot:"\u20DB",telrec:"\u2315",tfr:"\u{1D531}",there4:"\u2234",therefore:"\u2234",theta:"\u03B8",thetasym:"\u03D1",thetav:"\u03D1",thickapprox:"\u2248",thicksim:"\u223C",thinsp:"\u2009",thkap:"\u2248",thksim:"\u223C",thorn:"\xFE",tilde:"\u02DC",times:"\xD7",timesb:"\u22A0",timesbar:"\u2A31",timesd:"\u2A30",tint:"\u222D",toea:"\u2928",top:"\u22A4",topbot:"\u2336",topcir:"\u2AF1",topf:"\u{1D565}",topfork:"\u2ADA",tosa:"\u2929",tprime:"\u2034",trade:"\u2122",triangle:"\u25B5",triangledown:"\u25BF",triangleleft:"\u25C3",trianglelefteq:"\u22B4",triangleq:"\u225C",triangleright:"\u25B9",trianglerighteq:"\u22B5",tridot:"\u25EC",trie:"\u225C",triminus:"\u2A3A",triplus:"\u2A39",trisb:"\u29CD",tritime:"\u2A3B",trpezium:"\u23E2",tscr:"\u{1D4C9}",tscy:"\u0446",tshcy:"\u045B",tstrok:"\u0167",twixt:"\u226C",twoheadleftarrow:"\u219E",twoheadrightarrow:"\u21A0",uArr:"\u21D1",uHar:"\u2963",uacute:"\xFA",uarr:"\u2191",ubrcy:"\u045E",ubreve:"\u016D",ucirc:"\xFB",ucy:"\u0443",udarr:"\u21C5",udblac:"\u0171",udhar:"\u296E",ufisht:"\u297E",ufr:"\u{1D532}",ugrave:"\xF9",uharl:"\u21BF",uharr:"\u21BE",uhblk:"\u2580",ulcorn:"\u231C",ulcorner:"\u231C",ulcrop:"\u230F",ultri:"\u25F8",umacr:"\u016B",uml:"\xA8",uogon:"\u0173",uopf:"\u{1D566}",uparrow:"\u2191",updownarrow:"\u2195",upharpoonleft:"\u21BF",upharpoonright:"\u21BE",uplus:"\u228E",upsi:"\u03C5",upsih:"\u03D2",upsilon:"\u03C5",upuparrows:"\u21C8",urcorn:"\u231D",urcorner:"\u231D",urcrop:"\u230E",uring:"\u016F",urtri:"\u25F9",uscr:"\u{1D4CA}",utdot:"\u22F0",utilde:"\u0169",utri:"\u25B5",utrif:"\u25B4",uuarr:"\u21C8",uuml:"\xFC",uwangle:"\u29A7",vArr:"\u21D5",vBar:"\u2AE8",vBarv:"\u2AE9",vDash:"\u22A8",vangrt:"\u299C",varepsilon:"\u03F5",varkappa:"\u03F0",varnothing:"\u2205",varphi:"\u03D5",varpi:"\u03D6",varpropto:"\u221D",varr:"\u2195",varrho:"\u03F1",varsigma:"\u03C2",varsubsetneq:"\u228A\uFE00",varsubsetneqq:"\u2ACB\uFE00",varsupsetneq:"\u228B\uFE00",varsupsetneqq:"\u2ACC\uFE00",vartheta:"\u03D1",vartriangleleft:"\u22B2",vartriangleright:"\u22B3",vcy:"\u0432",vdash:"\u22A2",vee:"\u2228",veebar:"\u22BB",veeeq:"\u225A",vellip:"\u22EE",verbar:"|",vert:"|",vfr:"\u{1D533}",vltri:"\u22B2",vnsub:"\u2282\u20D2",vnsup:"\u2283\u20D2",vopf:"\u{1D567}",vprop:"\u221D",vrtri:"\u22B3",vscr:"\u{1D4CB}",vsubnE:"\u2ACB\uFE00",vsubne:"\u228A\uFE00",vsupnE:"\u2ACC\uFE00",vsupne:"\u228B\uFE00",vzigzag:"\u299A",wcirc:"\u0175",wedbar:"\u2A5F",wedge:"\u2227",wedgeq:"\u2259",weierp:"\u2118",wfr:"\u{1D534}",wopf:"\u{1D568}",wp:"\u2118",wr:"\u2240",wreath:"\u2240",wscr:"\u{1D4CC}",xcap:"\u22C2",xcirc:"\u25EF",xcup:"\u22C3",xdtri:"\u25BD",xfr:"\u{1D535}",xhArr:"\u27FA",xharr:"\u27F7",xi:"\u03BE",xlArr:"\u27F8",xlarr:"\u27F5",xmap:"\u27FC",xnis:"\u22FB",xodot:"\u2A00",xopf:"\u{1D569}",xoplus:"\u2A01",xotime:"\u2A02",xrArr:"\u27F9",xrarr:"\u27F6",xscr:"\u{1D4CD}",xsqcup:"\u2A06",xuplus:"\u2A04",xutri:"\u25B3",xvee:"\u22C1",xwedge:"\u22C0",yacute:"\xFD",yacy:"\u044F",ycirc:"\u0177",ycy:"\u044B",yen:"\xA5",yfr:"\u{1D536}",yicy:"\u0457",yopf:"\u{1D56A}",yscr:"\u{1D4CE}",yucy:"\u044E",yuml:"\xFF",zacute:"\u017A",zcaron:"\u017E",zcy:"\u0437",zdot:"\u017C",zeetrf:"\u2128",zeta:"\u03B6",zfr:"\u{1D537}",zhcy:"\u0436",zigrarr:"\u21DD",zopf:"\u{1D56B}",zscr:"\u{1D4CF}",zwj:"\u200D",zwnj:"\u200C"};var Pl={}.hasOwnProperty;function ot(e){return Pl.call(Hr,e)?Hr[e]:!1}r(ot,"decodeNamedCharacterReference");function re(e,t,n,i){let a=e.length,o=0,l;if(t<0?t=-t>a?0:a+t:t=t>a?a:t,n=n>0?n:0,i.length<1e4)l=Array.from(i),l.unshift(t,n),e.splice(...l);else for(n&&e.splice(t,n);o<i.length;)l=i.slice(o,o+1e4),l.unshift(t,0),e.splice(...l),o+=1e4,t+=1e4}r(re,"splice");function le(e,t){return e.length>0?(re(e,e.length,0,t),e):t}r(le,"push");var Go={}.hasOwnProperty;function An(e){let t={},n=-1;for(;++n<e.length;)$l(t,e[n]);return t}r(An,"combineExtensions");function $l(e,t){let n;for(n in t){let a=(Go.call(e,n)?e[n]:void 0)||(e[n]={}),o=t[n],l;if(o)for(l in o){Go.call(a,l)||(a[l]=[]);let s=o[l];zl(a[l],Array.isArray(s)?s:s?[s]:[])}}}r($l,"syntaxExtension");function zl(e,t){let n=-1,i=[];for(;++n<t.length;)(t[n].add==="after"?e:i).push(t[n]);re(e,0,0,i)}r(zl,"constructs");function Vt(e,t){let n=Number.parseInt(e,t);return n<9||n===11||n>13&&n<32||n>126&&n<160||n>55295&&n<57344||n>64975&&n<65008||(n&65535)===65535||(n&65535)===65534||n>1114111?"\uFFFD":String.fromCodePoint(n)}r(Vt,"decodeNumericCharacterReference");function ie(e){return e.replace(/[\t\n\r ]+/g," ").replace(/^ | $/g,"").toLowerCase().toUpperCase()}r(ie,"normalizeIdentifier");var ee=Ve(/[A-Za-z]/),Z=Ve(/[\dA-Za-z]/),Qo=Ve(/[#-'*+\--9=?A-Z^-~]/);function at(e){return e!==null&&(e<32||e===127)}r(at,"asciiControl");var Gt=Ve(/\d/),Ko=Ve(/[\dA-Fa-f]/),Ur=Ve(/[!-/:-@[-`{-~]/);function C(e){return e!==null&&e<-2}r(C,"markdownLineEnding");function M(e){return e!==null&&(e<0||e===32)}r(M,"markdownLineEndingOrSpace");function L(e){return e===-2||e===-1||e===32}r(L,"markdownSpace");var lt=Ve(/\p{P}|\p{S}/u),Ee=Ve(/\s/);function Ve(e){return t;function t(n){return n!==null&&n>-1&&e.test(String.fromCharCode(n))}}r(Ve,"regexCheck");var Rh={}.hasOwnProperty;function D(e,t,n,i){let a=i?i-1:1/0,o=0;return l;function l(c){return L(c)?(e.enter(n),s(c)):t(c)}function s(c){return L(c)&&o++<a?(e.consume(c),s):(e.exit(n),t(c))}}r(D,"factorySpace");function Wr(e,t,n,i,a,o){let l=0;return s;function s(h){return o>0&&L(h)?(e.enter(i),c(h)):u(h)}function c(h){return L(h)&&l<o?(e.consume(h),l++,c):(e.exit(i),u(h))}function u(h){return l>=a?t(h):n(h)}}r(Wr,"factorySpaceMinMax");var Yo={tokenize:Bl};function Bl(e){let t=e.attempt(this.parser.constructs.contentInitial,i,a),n;return t;function i(s){if(s===null){e.consume(s);return}return e.enter("lineEnding"),e.consume(s),e.exit("lineEnding"),D(e,t,"linePrefix")}function a(s){return e.enter("paragraph"),o(s)}function o(s){let c=e.enter("chunkText",{contentType:"text",previous:n});return n&&(n.next=c),n=c,l(s)}function l(s){if(s===null){e.exit("chunkText"),e.exit("paragraph"),e.consume(s);return}return C(s)?(e.consume(s),e.exit("chunkText"),o):(e.consume(s),l)}}r(Bl,"initializeContent");var Ne=class{static{r(this,"EditMap")}constructor(){this.index=new Map,this.map=[]}add(t,n,i){Zo(this,t,n,i,!1)}addBefore(t,n,i){Zo(this,t,n,i,!0)}consume(t){if(this.map.sort(function(o,l){return o[0]-l[0]}),this.map.length===0)return;let n=this.map.length,i=[];for(;n>0;)n-=1,i.push(t.slice(this.map[n][0]+this.map[n][1]),this.map[n][2]),t.length=this.map[n][0];i.push(t.slice()),t.length=0;let a=i.pop();for(;a;){for(let o of a)t.push(o);a=i.pop()}this.map.length=0,this.index.clear()}};function Zo(e,t,n,i,a){if(n===0&&i.length===0)return;let o=e.index.get(t);if(o){o[1]+=n,a?(i.push(...o[2]),o[2]=i):o[2].push(...i);return}let l=[t,n,i];e.map.push(l),e.index.set(t,l)}r(Zo,"addImplementation");var ea={tokenize:Nl},Xo={tokenize:Ml};function Nl(e){let t=this,n=[],i=0,a,o,l;return s;function s(_){if(i<n.length){let P=n[i];return t.containerState=P[1],e.attempt(P[0].continuation,c,u)(_)}return u(_)}function c(_){if(i++,t.containerState._closeFlow){t.containerState._closeFlow=void 0,a&&S();let P=t.events.length,$=P,y;for(;$--;)if(t.events[$][0]==="exit"&&t.events[$][1].type==="chunkFlow"){y=t.events[$][1].end;break}w(i);let F=P;for(;F<t.events.length;)t.events[F][1].end={...y},F++;let N=new Ne;return N.add($+1,0,t.events.slice(P)),N.add(P,F-P,[]),N.consume(t.events),u(_)}return s(_)}function u(_){if(i===n.length){if(!a)return d(_);if(a.currentConstruct&&a.currentConstruct.concrete)return b(_);t.interrupt=!!(a.currentConstruct&&!a._gfmTableDynamicInterruptHack)}return t.containerState={},e.check(Xo,h,f)(_)}function h(_){return a&&S(),w(i),d(_)}function f(_){return t.parser.lazy[t.now().line]=i!==n.length,l=t.now().offset,b(_)}function d(_){return t.containerState={},e.attempt(Xo,p,b)(_)}function p(_){return i++,n.push([t.currentConstruct,t.containerState]),d(_)}function b(_){if(_===null){a&&S(),w(0),e.consume(_);return}return a=a||t.parser.flow(t.now()),e.enter("chunkFlow",{_tokenizer:a,contentType:"flow",previous:o}),E(_)}function E(_){if(_===null){T(e.exit("chunkFlow"),!0),w(0),e.consume(_);return}return C(_)?(e.consume(_),T(e.exit("chunkFlow")),i=0,t.interrupt=void 0,s):(e.consume(_),E)}function T(_,P){let $=t.sliceStream(_);if(P&&$.push(null),_.previous=o,o&&(o.next=_),o=_,a.defineSkip(_.start),a.write($),t.parser.lazy[_.start.line]){let y=a.events.length;for(;y--;)if(a.events[y][1].start.offset<l&&(!a.events[y][1].end||a.events[y][1].end.offset>l))return;let F=t.events.length,N=F,W,x;for(;N--;)if(t.events[N][0]==="exit"&&t.events[N][1].type==="chunkFlow"){if(W){x=t.events[N][1].end;break}W=!0}for(w(i),y=F;y<t.events.length;)t.events[y][1].end={...x},y++;let z=new Ne;z.add(N+1,0,t.events.slice(F)),z.add(F,y-F,[]),z.consume(t.events)}}function w(_){let P=n.length;for(;P-- >_;){let $=n[P];t.containerState=$[1],$[0].exit.call(t,e)}n.length=_}function S(){a.write([null]),o=void 0,a=void 0,t.containerState._closeFlow=void 0}}r(Nl,"initializeDocument");function Ml(e,t,n){return D(e,e.attempt(this.parser.constructs.document,t,n),"linePrefix",this.parser.constructs.disable.null.includes("codeIndented")?void 0:4)}r(Ml,"tokenizeContainer");function Me(e){if(e===null||M(e)||Ee(e))return 1;if(lt(e))return 2}r(Me,"classifyCharacter");function Ge(e,t,n){let i=[],a=-1;for(;++a<e.length;){let o=e[a].resolveAll;o&&!i.includes(o)&&(t=o(t,n),i.push(o))}return t}r(Ge,"resolveAll");var Qt={name:"attention",resolveAll:Ol,tokenize:Hl};function Ol(e,t){let n=-1,i;for(;++n<e.length;)if(e[n][0]==="enter"&&e[n][1].type==="attentionSequence"&&e[n][1]._close){let a=n;for(;a--;)if(e[a][0]==="exit"&&e[a][1].type==="attentionSequence"&&e[a][1]._open&&t.sliceSerialize(e[a][1]).charCodeAt(0)===t.sliceSerialize(e[n][1]).charCodeAt(0)){if((e[a][1]._close||e[n][1]._open)&&(e[n][1].end.offset-e[n][1].start.offset)%3&&!((e[a][1].end.offset-e[a][1].start.offset+e[n][1].end.offset-e[n][1].start.offset)%3))continue;let o=e[a][1].end.offset-e[a][1].start.offset>1&&e[n][1].end.offset-e[n][1].start.offset>1?2:1,l={...e[a][1].end},s={...e[n][1].start};ta(l,-o),ta(s,o);let c={type:o>1?"strongSequence":"emphasisSequence",start:l,end:{...e[a][1].end}},u={type:o>1?"strongSequence":"emphasisSequence",start:{...e[n][1].start},end:s},h={type:o>1?"strongText":"emphasisText",start:{...e[a][1].end},end:{...e[n][1].start}},f={type:o>1?"strong":"emphasis",start:{...c.start},end:{...u.end}};e[a][1].end={...c.start},e[n][1].start={...u.end},i=[],e[a][1].end.offset-e[a][1].start.offset&&(i=le(i,[["enter",e[a][1],t],["exit",e[a][1],t]])),i=le(i,[["enter",f,t],["enter",c,t],["exit",c,t],["enter",h,t]]),i=le(i,Ge(t.parser.constructs.insideSpan.null,e.slice(a+1,n),t)),i=le(i,[["exit",h,t],["enter",u,t],["exit",u,t],["exit",f,t]]);let d=0;e[n][1].end.offset-e[n][1].start.offset&&(d=2,i=le(i,[["enter",e[n][1],t],["exit",e[n][1],t]])),re(e,a-1,n-a+3,i),n=a+i.length-d-2;break}}for(n=-1;++n<e.length;)e[n][1].type==="attentionSequence"&&(e[n][1].type="data");return e}r(Ol,"resolveAllAttention");function Hl(e,t){let n=this.parser.constructs.attentionMarkers.null,i=this.previous,a=Me(i),o;return l;function l(c){return o=c,e.enter("attentionSequence"),s(c)}function s(c){if(c===o)return e.consume(c),s;let u=e.exit("attentionSequence"),h=Me(c),f=!h||h===2&&a||n.includes(c)&&c!==42&&c!==95,d=!a||a===2&&h||n.includes(i)&&i!==42&&i!==95;return u._open=!!(o===42?f:f&&(a||!d)),u._close=!!(o===42?d:d&&(h||!f)),t(c)}}r(Hl,"tokenizeAttention");function ta(e,t){e.column+=t,e.offset+=t,e._bufferIndex+=t}r(ta,"movePoint");var jr={name:"autolink",tokenize:Ul};function Ul(e,t,n){let i=0;return a;function a(p){return e.enter("autolink"),e.enter("autolinkMarker"),e.consume(p),e.exit("autolinkMarker"),e.enter("autolinkProtocol"),o}function o(p){return ee(p)?(e.consume(p),l):p===64?n(p):u(p)}function l(p){return p===43||p===45||p===46||Z(p)?(i=1,s(p)):u(p)}function s(p){return p===58?(e.consume(p),i=0,c):(p===43||p===45||p===46||Z(p))&&i++<32?(e.consume(p),s):(i=0,u(p))}function c(p){return p===62?(e.exit("autolinkProtocol"),e.enter("autolinkMarker"),e.consume(p),e.exit("autolinkMarker"),e.exit("autolink"),t):p===null||p===32||p===60||at(p)?n(p):(e.consume(p),c)}function u(p){return p===64?(e.consume(p),h):Qo(p)?(e.consume(p),u):n(p)}function h(p){return Z(p)?f(p):n(p)}function f(p){return p===46?(e.consume(p),i=0,h):p===62?(e.exit("autolinkProtocol").type="autolinkEmail",e.enter("autolinkMarker"),e.consume(p),e.exit("autolinkMarker"),e.exit("autolink"),t):d(p)}function d(p){if((p===45||Z(p))&&i++<63){let b=p===45?d:f;return e.consume(p),b}return n(p)}}r(Ul,"tokenizeAutolink");var Ie={partial:!0,tokenize:Wl};function Wl(e,t,n){return i;function i(o){return L(o)?D(e,a,"linePrefix")(o):a(o)}function a(o){return o===null||C(o)?t(o):n(o)}}r(Wl,"tokenizeBlankLine");var En={continuation:{tokenize:Vl},exit:Gl,name:"blockQuote",tokenize:jl};function jl(e,t,n){let i=this;return a;function a(l){if(l===62){let s=i.containerState;return s.open||(e.enter("blockQuote",{_container:!0}),s.open=!0),e.enter("blockQuotePrefix"),e.enter("blockQuoteMarker"),e.consume(l),e.exit("blockQuoteMarker"),o}return n(l)}function o(l){return L(l)?(e.enter("blockQuotePrefixWhitespace"),e.consume(l),e.exit("blockQuotePrefixWhitespace"),e.exit("blockQuotePrefix"),t):(e.exit("blockQuotePrefix"),t(l))}}r(jl,"tokenizeBlockQuoteStart");function Vl(e,t,n){let i=this;return a;function a(l){return L(l)?D(e,o,"linePrefix",i.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(l):o(l)}function o(l){return e.attempt(En,t,n)(l)}}r(Vl,"tokenizeBlockQuoteContinuation");function Gl(e){e.exit("blockQuote")}r(Gl,"exit");var In={name:"characterEscape",tokenize:Ql};function Ql(e,t,n){return i;function i(o){return e.enter("characterEscape"),e.enter("escapeMarker"),e.consume(o),e.exit("escapeMarker"),a}function a(o){return Ur(o)?(e.enter("characterEscapeValue"),e.consume(o),e.exit("characterEscapeValue"),e.exit("characterEscape"),t):n(o)}}r(Ql,"tokenizeCharacterEscape");var Ln={name:"characterReference",tokenize:Kl};function Kl(e,t,n){let i=this,a=0,o,l;return s;function s(f){return e.enter("characterReference"),e.enter("characterReferenceMarker"),e.consume(f),e.exit("characterReferenceMarker"),c}function c(f){return f===35?(e.enter("characterReferenceMarkerNumeric"),e.consume(f),e.exit("characterReferenceMarkerNumeric"),u):(e.enter("characterReferenceValue"),o=31,l=Z,h(f))}function u(f){return f===88||f===120?(e.enter("characterReferenceMarkerHexadecimal"),e.consume(f),e.exit("characterReferenceMarkerHexadecimal"),e.enter("characterReferenceValue"),o=6,l=Ko,h):(e.enter("characterReferenceValue"),o=7,l=Gt,h(f))}function h(f){if(f===59&&a){let d=e.exit("characterReferenceValue");return l===Z&&!ot(i.sliceSerialize(d))?n(f):(e.enter("characterReferenceMarker"),e.consume(f),e.exit("characterReferenceMarker"),e.exit("characterReference"),t)}return l(f)&&a++<o?(e.consume(f),h):n(f)}}r(Kl,"tokenizeCharacterReference");var Kt={partial:!0,tokenize:Jl};function Jl(e,t,n){let i=this;return a;function a(l){return l===null?n(l):(e.enter("lineEnding"),e.consume(l),e.exit("lineEnding"),o)}function o(l){return i.parser.lazy[i.now().line]?n(l):t(l)}}r(Jl,"tokenizeNonLazyContinuation");var Dn={concrete:!0,name:"codeFenced",tokenize:Yl};function Yl(e,t,n){let i=this,a={partial:!0,tokenize:$},o=0,l=0,s;return c;function c(y){return u(y)}function u(y){let F=i.events[i.events.length-1];return o=F&&F[1].type==="linePrefix"?F[2].sliceSerialize(F[1],!0).length:0,s=y,e.enter("codeFenced"),e.enter("codeFencedFence"),e.enter("codeFencedFenceSequence"),h(y)}function h(y){return y===s?(l++,e.consume(y),h):l<3?n(y):(e.exit("codeFencedFenceSequence"),L(y)?D(e,f,"whitespace")(y):f(y))}function f(y){return y===null||C(y)?(e.exit("codeFencedFence"),i.interrupt?t(y):e.check(Kt,E,P)(y)):(e.enter("codeFencedFenceInfo"),e.enter("chunkString",{contentType:"string"}),d(y))}function d(y){return y===null||C(y)?(e.exit("chunkString"),e.exit("codeFencedFenceInfo"),f(y)):L(y)?(e.exit("chunkString"),e.exit("codeFencedFenceInfo"),D(e,p,"whitespace")(y)):y===96&&y===s?n(y):(e.consume(y),d)}function p(y){return y===null||C(y)?f(y):(e.enter("codeFencedFenceMeta"),e.enter("chunkString",{contentType:"string"}),b(y))}function b(y){return y===null||C(y)?(e.exit("chunkString"),e.exit("codeFencedFenceMeta"),f(y)):y===96&&y===s?n(y):(e.consume(y),b)}function E(y){return e.attempt(a,P,T)(y)}function T(y){return e.enter("lineEnding"),e.consume(y),e.exit("lineEnding"),w}function w(y){return o>0&&L(y)?D(e,S,"linePrefix",o+1)(y):S(y)}function S(y){return y===null||C(y)?e.check(Kt,E,P)(y):(e.enter("codeFlowValue"),_(y))}function _(y){return y===null||C(y)?(e.exit("codeFlowValue"),S(y)):(e.consume(y),_)}function P(y){return e.exit("codeFenced"),t(y)}function $(y,F,N){let W=0;return x;function x(B){return y.enter("lineEnding"),y.consume(B),y.exit("lineEnding"),z}function z(B){return y.enter("codeFencedFence"),L(B)?D(y,O,"linePrefix",i.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(B):O(B)}function O(B){return B===s?(y.enter("codeFencedFenceSequence"),I(B)):N(B)}function I(B){return B===s?(W++,y.consume(B),I):W>=l?(y.exit("codeFencedFenceSequence"),L(B)?D(y,H,"whitespace")(B):H(B)):N(B)}function H(B){return B===null||C(B)?(y.exit("codeFencedFence"),F(B)):N(B)}}}r(Yl,"tokenizeCodeFenced");var Jt={name:"codeIndented",tokenize:Xl},Zl={partial:!0,tokenize:es};function Xl(e,t,n){return i;function i(s){return e.enter("codeIndented"),Wr(e,a,n,"linePrefix",4,4)(s)}function a(s){return s===null?l(s):C(s)?e.attempt(Zl,a,l)(s):(e.enter("codeFlowValue"),o(s))}function o(s){return s===null||C(s)?(e.exit("codeFlowValue"),a(s)):(e.consume(s),o)}function l(s){return e.exit("codeIndented"),t(s)}}r(Xl,"tokenizeCodeIndented");function es(e,t,n){let i=this;return a;function a(l){return i.parser.lazy[i.now().line]?n(l):C(l)?(e.enter("lineEnding"),e.consume(l),e.exit("lineEnding"),a):Wr(e,t,o,"linePrefix",4,4)(l)}function o(l){return C(l)?a(l):n(l)}}r(es,"tokenizeFurtherStart");var Vr={name:"codeText",previous:ns,resolve:ts,tokenize:rs};function ts(e){let t=e.length-4,n=3,i,a;if((e[n][1].type==="lineEnding"||e[n][1].type==="space")&&(e[t][1].type==="lineEnding"||e[t][1].type==="space")){for(i=n;++i<t;)if(e[i][1].type==="codeTextData"){e[n][1].type="codeTextPadding",e[t][1].type="codeTextPadding",n+=2,t-=2;break}}for(i=n-1,t++;++i<=t;)a===void 0?i!==t&&e[i][1].type!=="lineEnding"&&(a=i):(i===t||e[i][1].type==="lineEnding")&&(e[a][1].type="codeTextData",i!==a+2&&(e[a][1].end=e[i-1][1].end,e.splice(a+2,i-a-2),t-=i-a-2,i=a+2),a=void 0);return e}r(ts,"resolveCodeText");function ns(e){return e!==96||this.events[this.events.length-1][1].type==="characterEscape"}r(ns,"previous");function rs(e,t,n){let i=this,a=0,o,l;return s;function s(d){return e.enter("codeText"),e.enter("codeTextSequence"),c(d)}function c(d){return d===96?(e.consume(d),a++,c):(e.exit("codeTextSequence"),u(d))}function u(d){return d===null?n(d):d===32?(e.enter("space"),e.consume(d),e.exit("space"),u):d===96?(l=e.enter("codeTextSequence"),o=0,f(d)):C(d)?(e.enter("lineEnding"),e.consume(d),e.exit("lineEnding"),u):(e.enter("codeTextData"),h(d))}function h(d){return d===null||d===32||d===96||C(d)?(e.exit("codeTextData"),u(d)):(e.consume(d),h)}function f(d){return d===96?(e.consume(d),o++,f):o===a?(e.exit("codeTextSequence"),e.exit("codeText"),t(d)):(l.type="codeTextData",h(d))}}r(rs,"tokenizeCodeText");var Zt=class{static{r(this,"SpliceBuffer")}constructor(t){this.left=t?[...t]:[],this.right=[]}get(t){if(t<0||t>=this.left.length+this.right.length)throw new RangeError("Cannot access index `"+t+"` in a splice buffer of size `"+(this.left.length+this.right.length)+"`");return t<this.left.length?this.left[t]:this.right[this.right.length-t+this.left.length-1]}get length(){return this.left.length+this.right.length}shift(){return this.setCursor(0),this.right.pop()}slice(t,n){let i=n??Number.POSITIVE_INFINITY;return i<this.left.length?this.left.slice(t,i):t>this.left.length?this.right.slice(this.right.length-i+this.left.length,this.right.length-t+this.left.length).reverse():this.left.slice(t).concat(this.right.slice(this.right.length-i+this.left.length).reverse())}splice(t,n,i){let a=n||0;this.setCursor(Math.trunc(t));let o=this.right.splice(this.right.length-a,Number.POSITIVE_INFINITY);return i&&Yt(this.left,i),o.reverse()}pop(){return this.setCursor(Number.POSITIVE_INFINITY),this.left.pop()}push(t){this.setCursor(Number.POSITIVE_INFINITY),this.left.push(t)}pushMany(t){this.setCursor(Number.POSITIVE_INFINITY),Yt(this.left,t)}unshift(t){this.setCursor(0),this.right.push(t)}unshiftMany(t){this.setCursor(0),Yt(this.right,t.reverse())}setCursor(t){if(!(t===this.left.length||t>this.left.length&&this.right.length===0||t<0&&this.left.length===0))if(t<this.left.length){let n=this.left.splice(t,Number.POSITIVE_INFINITY);Yt(this.right,n.reverse())}else{let n=this.right.splice(this.left.length+this.right.length-t,Number.POSITIVE_INFINITY);Yt(this.left,n.reverse())}}};function Yt(e,t){let n=0;if(t.length<1e4)e.push(...t);else for(;n<t.length;)e.push(...t.slice(n,n+1e4)),n+=1e4}r(Yt,"chunkedPush");function Fn(e){let t={},n=-1,i,a,o,l,s,c,u,h=new Zt(e);for(;++n<h.length;){for(;n in t;)n=t[n];if(i=h.get(n),n&&i[1].type==="chunkFlow"&&h.get(n-1)[1].type==="listItemPrefix"&&(c=i[1]._tokenizer.events,o=0,o<c.length&&c[o][1].type==="lineEndingBlank"&&(o+=2),o<c.length&&c[o][1].type==="content"))for(;++o<c.length&&c[o][1].type!=="content";)c[o][1].type==="chunkText"&&(c[o][1]._isInFirstContentOfListItem=!0,o++);if(i[0]==="enter")i[1].contentType&&(Object.assign(t,is(h,n)),n=t[n],u=!0);else if(i[1]._container){for(o=n,a=void 0;o--;)if(l=h.get(o),l[1].type==="lineEnding"||l[1].type==="lineEndingBlank")l[0]==="enter"&&(a&&(h.get(a)[1].type="lineEndingBlank"),l[1].type="lineEnding",a=o);else if(!(l[1].type==="linePrefix"||l[1].type==="listItemIndent"))break;a&&(i[1].end={...h.get(a)[1].start},s=h.slice(a,n),s.unshift(i),h.splice(a,n-a+1,s))}}return re(e,0,Number.POSITIVE_INFINITY,h.slice(0)),!u}r(Fn,"subtokenize");function is(e,t){let n=e.get(t)[1],i=e.get(t)[2],a=t-1,o=[],l=n._tokenizer;l||(l=i.parser[n.contentType](n.start),n._contentTypeTextTrailing&&(l._contentTypeTextTrailing=!0));let s=l.events,c=[],u={},h,f,d=-1,p=n,b=0,E=0,T=[E];for(;p;){for(;e.get(++a)[1]!==p;);o.push(a),p._tokenizer||(h=i.sliceStream(p),p.next||h.push(null),f&&l.defineSkip(p.start),p._isInFirstContentOfListItem&&(l._gfmTasklistFirstContentOfListItem=!0),l.write(h),p._isInFirstContentOfListItem&&(l._gfmTasklistFirstContentOfListItem=void 0)),f=p,p=p.next}for(p=n;++d<s.length;)s[d][0]==="exit"&&s[d-1][0]==="enter"&&s[d][1].type===s[d-1][1].type&&s[d][1].start.line!==s[d][1].end.line&&(E=d+1,T.push(E),p._tokenizer=void 0,p.previous=void 0,p=p.next);for(l.events=[],p?(p._tokenizer=void 0,p.previous=void 0):T.pop(),d=T.length;d--;){let w=s.slice(T[d],T[d+1]),S=o.pop();c.push([S,S+w.length-1]),e.splice(S,2,w)}for(c.reverse(),d=-1;++d<c.length;)u[b+c[d][0]]=b+c[d][1],b+=c[d][1]-c[d][0]-1;return u}r(is,"subcontent");var Gr={resolve:as,tokenize:ls},os={partial:!0,tokenize:ss};function as(e){return Fn(e),e}r(as,"resolveContent");function ls(e,t){let n;return i;function i(s){return e.enter("content"),n=e.enter("chunkContent",{contentType:"content"}),a(s)}function a(s){return s===null?o(s):C(s)?e.check(os,l,o)(s):(e.consume(s),a)}function o(s){return e.exit("chunkContent"),e.exit("content"),t(s)}function l(s){return e.consume(s),e.exit("chunkContent"),n.next=e.enter("chunkContent",{contentType:"content",previous:n}),n=n.next,a}}r(ls,"tokenizeContent");function ss(e,t,n){let i=this;return a;function a(l){return e.exit("chunkContent"),e.enter("lineEnding"),e.consume(l),e.exit("lineEnding"),D(e,o,"linePrefix")}function o(l){if(l===null||C(l))return n(l);let s=i.events[i.events.length-1];return!i.parser.constructs.disable.null.includes("codeIndented")&&s&&s[1].type==="linePrefix"&&s[2].sliceSerialize(s[1],!0).length>=4?t(l):e.interrupt(i.parser.constructs.flow,n,t)(l)}}r(ss,"tokenizeContinuation");function Pn(e,t,n,i,a,o,l,s,c){let u=c||Number.POSITIVE_INFINITY,h=0;return f;function f(w){return w===60?(e.enter(i),e.enter(a),e.enter(o),e.consume(w),e.exit(o),d):w===null||w===32||w===41||at(w)?n(w):(e.enter(i),e.enter(l),e.enter(s),e.enter("chunkString",{contentType:"string"}),E(w))}function d(w){return w===62?(e.enter(o),e.consume(w),e.exit(o),e.exit(a),e.exit(i),t):(e.enter(s),e.enter("chunkString",{contentType:"string"}),p(w))}function p(w){return w===62?(e.exit("chunkString"),e.exit(s),d(w)):w===null||w===60||C(w)?n(w):(e.consume(w),w===92?b:p)}function b(w){return w===60||w===62||w===92?(e.consume(w),p):p(w)}function E(w){return!h&&(w===null||w===41||M(w))?(e.exit("chunkString"),e.exit(s),e.exit(l),e.exit(i),t(w)):h<u&&w===40?(e.consume(w),h++,E):w===41?(e.consume(w),h--,E):w===null||w===32||w===40||at(w)?n(w):(e.consume(w),w===92?T:E)}function T(w){return w===40||w===41||w===92?(e.consume(w),E):E(w)}}r(Pn,"factoryDestination");function $n(e,t,n,i,a,o){let l=this,s=0,c;return u;function u(p){return e.enter(i),e.enter(a),e.consume(p),e.exit(a),e.enter(o),h}function h(p){return s>999||p===null||p===91||p===93&&!c||p===94&&!s&&"_hiddenFootnoteSupport"in l.parser.constructs?n(p):p===93?(e.exit(o),e.enter(a),e.consume(p),e.exit(a),e.exit(i),t):C(p)?(e.enter("lineEnding"),e.consume(p),e.exit("lineEnding"),h):(e.enter("chunkString",{contentType:"string"}),f(p))}function f(p){return p===null||p===91||p===93||C(p)||s++>999?(e.exit("chunkString"),h(p)):(e.consume(p),c||(c=!L(p)),p===92?d:f)}function d(p){return p===91||p===92||p===93?(e.consume(p),s++,f):f(p)}}r($n,"factoryLabel");function zn(e,t,n,i,a,o){let l;return s;function s(d){return d===34||d===39||d===40?(e.enter(i),e.enter(a),e.consume(d),e.exit(a),l=d===40?41:d,c):n(d)}function c(d){return d===l?(e.enter(a),e.consume(d),e.exit(a),e.exit(i),t):(e.enter(o),u(d))}function u(d){return d===l?(e.exit(o),c(l)):d===null?n(d):C(d)?(e.enter("lineEnding"),e.consume(d),e.exit("lineEnding"),D(e,u,"linePrefix")):(e.enter("chunkString",{contentType:"string"}),h(d))}function h(d){return d===l||d===null||C(d)?(e.exit("chunkString"),u(d)):(e.consume(d),d===92?f:h)}function f(d){return d===l||d===92?(e.consume(d),h):h(d)}}r(zn,"factoryTitle");function st(e,t){let n;return i;function i(a){return C(a)?(e.enter("lineEnding"),e.consume(a),e.exit("lineEnding"),n=!0,i):L(a)?D(e,i,n?"linePrefix":"lineSuffix")(a):t(a)}}r(st,"factoryWhitespace");var Qr={name:"definition",tokenize:us},cs={partial:!0,tokenize:fs};function us(e,t,n){let i=this,a;return o;function o(p){return e.enter("definition"),l(p)}function l(p){return $n.call(i,e,s,n,"definitionLabel","definitionLabelMarker","definitionLabelString")(p)}function s(p){return a=ie(i.sliceSerialize(i.events[i.events.length-1][1]).slice(1,-1)),p===58?(e.enter("definitionMarker"),e.consume(p),e.exit("definitionMarker"),c):n(p)}function c(p){return M(p)?st(e,u)(p):u(p)}function u(p){return Pn(e,h,n,"definitionDestination","definitionDestinationLiteral","definitionDestinationLiteralMarker","definitionDestinationRaw","definitionDestinationString")(p)}function h(p){return e.attempt(cs,f,f)(p)}function f(p){return L(p)?D(e,d,"whitespace")(p):d(p)}function d(p){return p===null||C(p)?(e.exit("definition"),i.parser.defined.push(a),t(p)):n(p)}}r(us,"tokenizeDefinition");function fs(e,t,n){return i;function i(s){return M(s)?st(e,a)(s):n(s)}function a(s){return zn(e,o,n,"definitionTitle","definitionTitleMarker","definitionTitleString")(s)}function o(s){return L(s)?D(e,l,"whitespace")(s):l(s)}function l(s){return s===null||C(s)?t(s):n(s)}}r(fs,"tokenizeTitleBefore");var Kr={name:"hardBreakEscape",tokenize:hs};function hs(e,t,n){return i;function i(o){return e.enter("hardBreakEscape"),e.consume(o),a}function a(o){return C(o)?(e.exit("hardBreakEscape"),t(o)):n(o)}}r(hs,"tokenizeHardBreakEscape");var Jr={name:"headingAtx",resolve:ps,tokenize:ds};function ps(e,t){let n=e.length-2,i=3;if(e[i][1].type==="whitespace"&&(i+=2),n-2>i&&e[n][1].type==="whitespace"&&(n-=2),e[n][1].type==="atxHeadingSequence"&&(i===n-1||n-4>i&&e[n-2][1].type==="whitespace")&&(n-=i+1===n?2:4),n>i){let a={type:"atxHeadingText",start:e[i][1].start,end:e[n][1].end},o={type:"chunkText",start:e[i][1].start,end:e[n][1].end,contentType:"text"};re(e,i,n-i+1,[["enter",a,t],["enter",o,t],["exit",o,t],["exit",a,t]])}return e}r(ps,"resolveHeadingAtx");function ds(e,t,n){let i=0;return a;function a(h){return e.enter("atxHeading"),o(h)}function o(h){return e.enter("atxHeadingSequence"),l(h)}function l(h){return h===35&&i++<6?(e.consume(h),l):h===null||M(h)?(e.exit("atxHeadingSequence"),s(h)):n(h)}function s(h){return h===35?(e.enter("atxHeadingSequence"),c(h)):h===null||C(h)?(e.exit("atxHeading"),t(h)):L(h)?D(e,s,"whitespace")(h):(e.enter("atxHeadingText"),u(h))}function c(h){return h===35?(e.consume(h),c):(e.exit("atxHeadingSequence"),s(h))}function u(h){return h===null||h===35||M(h)?(e.exit("atxHeadingText"),s(h)):(e.consume(h),u)}}r(ds,"tokenizeHeadingAtx");var Yr=["address","article","aside","base","basefont","blockquote","body","caption","center","col","colgroup","dd","details","dialog","dir","div","dl","dt","fieldset","figcaption","figure","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hr","html","iframe","legend","li","link","main","menu","menuitem","nav","noframes","ol","optgroup","option","p","param","search","section","summary","table","tbody","td","tfoot","th","thead","title","tr","track","ul"],qn=["pre","script","style","textarea"];var Zr={concrete:!0,name:"htmlFlow",resolveTo:gs,tokenize:xs},ms={partial:!0,tokenize:bs};function gs(e){let t=e.length;for(;t--&&!(e[t][0]==="enter"&&e[t][1].type==="htmlFlow"););return t>1&&e[t-2][1].type==="linePrefix"&&(e[t][1].start=e[t-2][1].start,e[t+1][1].start=e[t-2][1].start,e.splice(t-2,2)),e}r(gs,"resolveToHtmlFlow");function xs(e,t,n){let i=this,a,o,l,s,c;return u;function u(g){return h(g)}function h(g){return e.enter("htmlFlow"),e.enter("htmlFlowData"),e.consume(g),f}function f(g){return g===33?(e.consume(g),d):g===47?(e.consume(g),o=!0,E):g===63?(e.consume(g),a=3,i.interrupt?t:m):ee(g)?(e.consume(g),l=String.fromCharCode(g),T):n(g)}function d(g){return g===45?(e.consume(g),a=2,p):g===91?(e.consume(g),a=5,s=0,b):ee(g)?(e.consume(g),a=4,i.interrupt?t:m):n(g)}function p(g){return g===45?(e.consume(g),i.interrupt?t:m):n(g)}function b(g){let de="CDATA[";return g===de.charCodeAt(s++)?(e.consume(g),s===de.length?i.interrupt?t:O:b):n(g)}function E(g){return ee(g)?(e.consume(g),l=String.fromCharCode(g),T):n(g)}function T(g){if(g===null||g===47||g===62||M(g)){let de=g===47,mt=l.toLowerCase();return!de&&!o&&qn.includes(mt)?(a=1,i.interrupt?t(g):O(g)):Yr.includes(l.toLowerCase())?(a=6,de?(e.consume(g),w):i.interrupt?t(g):O(g)):(a=7,i.interrupt&&!i.parser.lazy[i.now().line]?n(g):o?S(g):_(g))}return g===45||Z(g)?(e.consume(g),l+=String.fromCharCode(g),T):n(g)}function w(g){return g===62?(e.consume(g),i.interrupt?t:O):n(g)}function S(g){return L(g)?(e.consume(g),S):x(g)}function _(g){return g===47?(e.consume(g),x):g===58||g===95||ee(g)?(e.consume(g),P):L(g)?(e.consume(g),_):x(g)}function P(g){return g===45||g===46||g===58||g===95||Z(g)?(e.consume(g),P):$(g)}function $(g){return g===61?(e.consume(g),y):L(g)?(e.consume(g),$):_(g)}function y(g){return g===null||g===60||g===61||g===62||g===96?n(g):g===34||g===39?(e.consume(g),c=g,F):L(g)?(e.consume(g),y):N(g)}function F(g){return g===c?(e.consume(g),c=null,W):g===null||C(g)?n(g):(e.consume(g),F)}function N(g){return g===null||g===34||g===39||g===47||g===60||g===61||g===62||g===96||M(g)?$(g):(e.consume(g),N)}function W(g){return g===47||g===62||L(g)?_(g):n(g)}function x(g){return g===62?(e.consume(g),z):n(g)}function z(g){return g===null||C(g)?O(g):L(g)?(e.consume(g),z):n(g)}function O(g){return g===45&&a===2?(e.consume(g),J):g===60&&a===1?(e.consume(g),te):g===62&&a===4?(e.consume(g),be):g===63&&a===3?(e.consume(g),m):g===93&&a===5?(e.consume(g),_e):C(g)&&(a===6||a===7)?(e.exit("htmlFlowData"),e.check(ms,De,I)(g)):g===null||C(g)?(e.exit("htmlFlowData"),I(g)):(e.consume(g),O)}function I(g){return e.check(Kt,H,De)(g)}function H(g){return e.enter("lineEnding"),e.consume(g),e.exit("lineEnding"),B}function B(g){return g===null||C(g)?I(g):(e.enter("htmlFlowData"),O(g))}function J(g){return g===45?(e.consume(g),m):O(g)}function te(g){return g===47?(e.consume(g),l="",ye):O(g)}function ye(g){if(g===62){let de=l.toLowerCase();return qn.includes(de)?(e.consume(g),be):O(g)}return ee(g)&&l.length<8?(e.consume(g),l+=String.fromCharCode(g),ye):O(g)}function _e(g){return g===93?(e.consume(g),m):O(g)}function m(g){return g===62?(e.consume(g),be):g===45&&a===2?(e.consume(g),m):O(g)}function be(g){return g===null||C(g)?(e.exit("htmlFlowData"),De(g)):(e.consume(g),be)}function De(g){return e.exit("htmlFlow"),t(g)}}r(xs,"tokenizeHtmlFlow");function bs(e,t,n){return i;function i(a){return e.enter("lineEnding"),e.consume(a),e.exit("lineEnding"),e.attempt(Ie,t,n)}}r(bs,"tokenizeBlankLineBefore");var Xr={name:"htmlText",tokenize:ks};function ks(e,t,n){let i=this,a,o,l;return s;function s(m){return e.enter("htmlText"),e.enter("htmlTextData"),e.consume(m),c}function c(m){return m===33?(e.consume(m),u):m===47?(e.consume(m),$):m===63?(e.consume(m),_):ee(m)?(e.consume(m),N):n(m)}function u(m){return m===45?(e.consume(m),h):m===91?(e.consume(m),o=0,b):ee(m)?(e.consume(m),S):n(m)}function h(m){return m===45?(e.consume(m),p):n(m)}function f(m){return m===null?n(m):m===45?(e.consume(m),d):C(m)?(l=f,te(m)):(e.consume(m),f)}function d(m){return m===45?(e.consume(m),p):f(m)}function p(m){return m===62?J(m):m===45?d(m):f(m)}function b(m){let be="CDATA[";return m===be.charCodeAt(o++)?(e.consume(m),o===be.length?E:b):n(m)}function E(m){return m===null?n(m):m===93?(e.consume(m),T):C(m)?(l=E,te(m)):(e.consume(m),E)}function T(m){return m===93?(e.consume(m),w):E(m)}function w(m){return m===62?J(m):m===93?(e.consume(m),w):E(m)}function S(m){return m===null||m===62?J(m):C(m)?(l=S,te(m)):(e.consume(m),S)}function _(m){return m===null?n(m):m===63?(e.consume(m),P):C(m)?(l=_,te(m)):(e.consume(m),_)}function P(m){return m===62?J(m):_(m)}function $(m){return ee(m)?(e.consume(m),y):n(m)}function y(m){return m===45||Z(m)?(e.consume(m),y):F(m)}function F(m){return C(m)?(l=F,te(m)):L(m)?(e.consume(m),F):J(m)}function N(m){return m===45||Z(m)?(e.consume(m),N):m===47||m===62||M(m)?W(m):n(m)}function W(m){return m===47?(e.consume(m),J):m===58||m===95||ee(m)?(e.consume(m),x):C(m)?(l=W,te(m)):L(m)?(e.consume(m),W):J(m)}function x(m){return m===45||m===46||m===58||m===95||Z(m)?(e.consume(m),x):z(m)}function z(m){return m===61?(e.consume(m),O):C(m)?(l=z,te(m)):L(m)?(e.consume(m),z):W(m)}function O(m){return m===null||m===60||m===61||m===62||m===96?n(m):m===34||m===39?(e.consume(m),a=m,I):C(m)?(l=O,te(m)):L(m)?(e.consume(m),O):(e.consume(m),H)}function I(m){return m===a?(e.consume(m),a=void 0,B):m===null?n(m):C(m)?(l=I,te(m)):(e.consume(m),I)}function H(m){return m===null||m===34||m===39||m===60||m===61||m===96?n(m):m===47||m===62||M(m)?W(m):(e.consume(m),H)}function B(m){return m===47||m===62||M(m)?W(m):n(m)}function J(m){return m===62?(e.consume(m),e.exit("htmlTextData"),e.exit("htmlText"),t):n(m)}function te(m){return e.exit("htmlTextData"),e.enter("lineEnding"),e.consume(m),e.exit("lineEnding"),ye}function ye(m){return L(m)?D(e,_e,"linePrefix",i.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(m):_e(m)}function _e(m){return e.enter("htmlTextData"),l(m)}}r(ks,"tokenizeHtmlText");var ct={name:"labelEnd",resolveAll:_s,resolveTo:Ss,tokenize:Cs},ws={tokenize:Ts},ys={tokenize:As},vs={tokenize:Es};function _s(e){let t=-1,n=[];for(;++t<e.length;){let i=e[t][1];if(n.push(e[t]),i.type==="labelImage"||i.type==="labelLink"||i.type==="labelEnd"){let a=i.type==="labelImage"?4:2;i.type="data",t+=a}}return e.length!==n.length&&re(e,0,e.length,n),e}r(_s,"resolveAllLabelEnd");function Ss(e,t){let n=e.length,i=0,a,o,l;for(;n--;){let h=e[n][1];if(a){if(h.type==="link"||h.type==="labelLink"&&h._inactive)break;e[n][0]==="enter"&&h.type==="labelLink"&&(h._inactive=!0)}else if(o){if(e[n][0]==="enter"&&(h.type==="labelImage"||h.type==="labelLink")&&!h._balanced&&(a=n,h.type!=="labelLink")){i=2;break}}else h.type==="labelEnd"&&(o=n)}let s={type:e[a][1].type==="labelLink"?"link":"image",start:{...e[a][1].start},end:{...e[e.length-1][1].end}},c={type:"label",start:{...e[a][1].start},end:{...e[o][1].end}},u={type:"labelText",start:{...e[a+i+2][1].end},end:{...e[o-2][1].start}};return l=[["enter",s,t],["enter",c,t]],l=le(l,e.slice(a+1,a+i+3)),l=le(l,[["enter",u,t]]),l=le(l,Ge(t.parser.constructs.insideSpan.null,e.slice(a+i+4,o-3),t)),l=le(l,[["exit",u,t],e[o-2],e[o-1],["exit",c,t]]),l=le(l,e.slice(o+1)),l=le(l,[["exit",s,t]]),re(e,a,e.length,l),e}r(Ss,"resolveToLabelEnd");function Cs(e,t,n){let i=this,a=i._labelStarts,o,l;if(a){for(;a.length>0&&a[a.length-1]._balanced;)a.pop();o=a[a.length-1]}return s;function s(d){return o?o._inactive?f(d):(l=i.parser.defined.includes(ie(i.sliceSerialize({start:o.end,end:i.now()}))),e.enter("labelEnd"),e.enter("labelMarker"),e.consume(d),e.exit("labelMarker"),e.exit("labelEnd"),c):n(d)}function c(d){return d===40?e.attempt(ws,h,l?h:f)(d):d===91?e.attempt(ys,h,l?u:f)(d):l?h(d):f(d)}function u(d){return e.attempt(vs,h,f)(d)}function h(d){return a.pop(),t(d)}function f(d){return o._balanced=!0,n(d)}}r(Cs,"tokenizeLabelEnd");function Ts(e,t,n){return i;function i(f){return e.enter("resource"),e.enter("resourceMarker"),e.consume(f),e.exit("resourceMarker"),a}function a(f){return M(f)?st(e,o)(f):o(f)}function o(f){return f===41?h(f):Pn(e,l,s,"resourceDestination","resourceDestinationLiteral","resourceDestinationLiteralMarker","resourceDestinationRaw","resourceDestinationString",32)(f)}function l(f){return M(f)?st(e,c)(f):h(f)}function s(f){return n(f)}function c(f){return f===34||f===39||f===40?zn(e,u,n,"resourceTitle","resourceTitleMarker","resourceTitleString")(f):h(f)}function u(f){return M(f)?st(e,h)(f):h(f)}function h(f){return f===41?(e.enter("resourceMarker"),e.consume(f),e.exit("resourceMarker"),e.exit("resource"),t):n(f)}}r(Ts,"tokenizeResource");function As(e,t,n){let i=this;return a;function a(s){return $n.call(i,e,o,l,"reference","referenceMarker","referenceString")(s)}function o(s){return i.parser.defined.includes(ie(i.sliceSerialize(i.events[i.events.length-1][1]).slice(1,-1)))?t(s):n(s)}function l(s){return n(s)}}r(As,"tokenizeReferenceFull");function Es(e,t,n){return i;function i(o){return e.enter("reference"),e.enter("referenceMarker"),e.consume(o),e.exit("referenceMarker"),a}function a(o){return o===93?(e.enter("referenceMarker"),e.consume(o),e.exit("referenceMarker"),e.exit("reference"),t):n(o)}}r(Es,"tokenizeReferenceCollapsed");var ei={name:"labelStartImage",resolveAll:ct.resolveAll,tokenize:Is};function Is(e,t,n){let i=this,a;return o;function o(c){return e.enter("labelImage"),e.enter("labelImageMarker"),e.consume(c),e.exit("labelImageMarker"),l}function l(c){return c===91?(e.enter("labelMarker"),e.consume(c),e.exit("labelMarker"),a=e.exit("labelImage"),s):n(c)}function s(c){return c===94&&"_hiddenFootnoteSupport"in i.parser.constructs?n(c):(i._labelStarts=i._labelStarts||[],i._labelStarts.push(a),t(c))}}r(Is,"tokenizeLabelStartImage");var ti={name:"labelStartLink",resolveAll:ct.resolveAll,tokenize:Ls};function Ls(e,t,n){let i=this,a;return o;function o(s){return e.enter("labelLink"),e.enter("labelMarker"),e.consume(s),e.exit("labelMarker"),a=e.exit("labelLink"),l}function l(s){return s===94&&"_hiddenFootnoteSupport"in i.parser.constructs?n(s):(i._labelStarts=i._labelStarts||[],i._labelStarts.push(a),t(s))}}r(Ls,"tokenizeLabelStartLink");var Xt={name:"lineEnding",tokenize:Ds};function Ds(e,t){return n;function n(i){return e.enter("lineEnding"),e.consume(i),e.exit("lineEnding"),D(e,t,"linePrefix")}}r(Ds,"tokenizeLineEnding");var ut={name:"thematicBreak",tokenize:Fs};function Fs(e,t,n){let i=0,a;return o;function o(u){return e.enter("thematicBreak"),l(u)}function l(u){return a=u,s(u)}function s(u){return u===a?(e.enter("thematicBreakSequence"),c(u)):i>=3&&(u===null||C(u))?(e.exit("thematicBreak"),t(u)):n(u)}function c(u){return u===a?(e.consume(u),i++,c):(e.exit("thematicBreakSequence"),L(u)?D(e,s,"whitespace")(u):s(u))}}r(Fs,"tokenizeThematicBreak");var se={continuation:{tokenize:qs},exit:Bs,name:"list",tokenize:zs},Ps={partial:!0,tokenize:Ns},$s={partial:!0,tokenize:Rs};function zs(e,t,n){let i=this,a=i.events[i.events.length-1],o=a&&a[1].type==="linePrefix"?a[2].sliceSerialize(a[1],!0).length:0,l=0;return s;function s(p){let b=i.containerState.type||(p===42||p===43||p===45?"listUnordered":"listOrdered");if(b==="listUnordered"?!i.containerState.marker||p===i.containerState.marker:Gt(p)){if(i.containerState.type||(i.containerState.type=b,e.enter(b,{_container:!0})),b==="listUnordered")return e.enter("listItemPrefix"),p===42||p===45?e.check(ut,n,u)(p):u(p);if(!i.interrupt||p===49)return e.enter("listItemPrefix"),e.enter("listItemValue"),c(p)}return n(p)}function c(p){return Gt(p)&&++l<10?(e.consume(p),c):(!i.interrupt||l<2)&&(i.containerState.marker?p===i.containerState.marker:p===41||p===46)?(e.exit("listItemValue"),u(p)):n(p)}function u(p){return e.enter("listItemMarker"),e.consume(p),e.exit("listItemMarker"),i.containerState.marker=i.containerState.marker||p,e.check(Ie,i.interrupt?n:h,e.attempt(Ps,d,f))}function h(p){return i.containerState.initialBlankLine=!0,o++,d(p)}function f(p){return L(p)?(e.enter("listItemPrefixWhitespace"),e.consume(p),e.exit("listItemPrefixWhitespace"),d):n(p)}function d(p){return i.containerState.size=o+i.sliceSerialize(e.exit("listItemPrefix"),!0).length,t(p)}}r(zs,"tokenizeListStart");function qs(e,t,n){let i=this;return i.containerState._closeFlow=void 0,e.check(Ie,a,o);function a(s){return i.containerState.furtherBlankLines=i.containerState.furtherBlankLines||i.containerState.initialBlankLine,D(e,t,"listItemIndent",i.containerState.size+1)(s)}r(a,"onBlank");function o(s){return i.containerState.furtherBlankLines||!L(s)?(i.containerState.furtherBlankLines=void 0,i.containerState.initialBlankLine=void 0,l(s)):(i.containerState.furtherBlankLines=void 0,i.containerState.initialBlankLine=void 0,e.attempt($s,t,l)(s))}r(o,"notBlank");function l(s){return i.containerState._closeFlow=!0,i.interrupt=void 0,D(e,e.attempt(se,t,n),"linePrefix",i.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(s)}r(l,"notInCurrentItem")}r(qs,"tokenizeListContinuation");function Rs(e,t,n){let i=this;return D(e,a,"listItemIndent",i.containerState.size+1);function a(o){let l=i.events[i.events.length-1];return l&&l[1].type==="listItemIndent"&&l[2].sliceSerialize(l[1],!0).length===i.containerState.size?t(o):n(o)}}r(Rs,"tokenizeIndent");function Bs(e){e.exit(this.containerState.type)}r(Bs,"tokenizeListEnd");function Ns(e,t,n){let i=this;return D(e,a,"listItemPrefixWhitespace",i.parser.constructs.disable.null.includes("codeIndented")?void 0:5);function a(o){let l=i.events[i.events.length-1];return!L(o)&&l&&l[1].type==="listItemPrefixWhitespace"?t(o):n(o)}}r(Ns,"tokenizeListItemPrefixWhitespace");var Rn={name:"setextUnderline",resolveTo:Ms,tokenize:Os};function Ms(e,t){let n=new Ne,i=e.length,a,o,l;for(;i--;)if(e[i][0]==="enter"){if(e[i][1].type==="content"){a=i;break}e[i][1].type==="paragraph"&&(o=i)}else e[i][1].type==="content"&&n.add(i,1,[]),!l&&e[i][1].type==="definition"&&(l=i);let s={type:"setextHeading",start:{...e[a][1].start},end:{...e[e.length-1][1].end}};return e[o][1].type="setextHeadingText",l?(n.add(o,0,[["enter",s,t]]),n.add(l+1,0,[["exit",e[a][1],t]]),e[a][1].end={...e[l][1].end}):e[a][1]=s,n.add(e.length,0,[["exit",s,t]]),n.consume(e),e}r(Ms,"resolveToSetextUnderline");function Os(e,t,n){let i=this,a;return o;function o(u){let h=i.events.length,f;for(;h--;)if(i.events[h][1].type!=="lineEnding"&&i.events[h][1].type!=="linePrefix"&&i.events[h][1].type!=="content"){f=i.events[h][1].type==="paragraph";break}return!i.parser.lazy[i.now().line]&&(i.interrupt||f)?(e.enter("setextHeadingLine"),a=u,l(u)):n(u)}function l(u){return e.enter("setextHeadingLineSequence"),s(u)}function s(u){return u===a?(e.consume(u),s):(e.exit("setextHeadingLineSequence"),L(u)?D(e,c,"lineSuffix")(u):c(u))}function c(u){return u===null||C(u)?(e.exit("setextHeadingLine"),t(u)):n(u)}}r(Os,"tokenizeSetextUnderline");var na={tokenize:Hs};function Hs(e){let t=this,n=e.attempt(Ie,i,e.attempt(this.parser.constructs.flowInitial,a,D(e,e.attempt(this.parser.constructs.flow,a,e.attempt(Gr,a)),"linePrefix")));return n;function i(o){if(o===null){e.consume(o);return}return e.enter("lineEndingBlank"),e.consume(o),e.exit("lineEndingBlank"),t.currentConstruct=void 0,n}function a(o){if(o===null){e.consume(o);return}return e.enter("lineEnding"),e.consume(o),e.exit("lineEnding"),t.currentConstruct=void 0,n}}r(Hs,"initializeFlow");var ra={resolveAll:la()},ia=aa("string"),oa=aa("text");function aa(e){return{resolveAll:la(e==="text"?Us:void 0),tokenize:t};function t(n){let i=this,a=this.parser.constructs[e],o=n.attempt(a,l,s);return l;function l(h){return u(h)?o(h):s(h)}function s(h){if(h===null){n.consume(h);return}return n.enter("data"),n.consume(h),c}function c(h){return u(h)?(n.exit("data"),o(h)):(n.consume(h),c)}function u(h){if(h===null)return!0;let f=a[h],d=-1;if(f)for(;++d<f.length;){let p=f[d];if(!p.previous||p.previous.call(i,i.previous))return!0}return!1}}}r(aa,"initializeFactory");function la(e){return t;function t(n,i){let a=-1,o;for(;++a<=n.length;)o===void 0?n[a]&&n[a][1].type==="data"&&(o=a,a++):(!n[a]||n[a][1].type!=="data")&&(a!==o+2&&(n[o][1].end=n[a-1][1].end,n.splice(o+2,a-o-2),a=o+2),o=void 0);return e?e(n,i):n}}r(la,"createResolver");function Us(e,t){let n=new Ne,i=0;for(;++i<=e.length;)if((i===e.length||e[i][1].type==="lineEnding")&&e[i-1][1].type==="data"){let a=e[i-1][1],o=t.sliceStream(a),l=o.length,s=-1,c=0,u;for(;l--;){let h=o[l];if(typeof h=="string"){for(s=h.length;h.charCodeAt(s-1)===32;)c++,s--;if(s)break;s=-1}else if(h===-2)u=!0,c++;else if(h!==-1){l++;break}}if(t._contentTypeTextTrailing&&i===e.length&&(c=0),c){let h={type:i===e.length||u||c<2?"lineSuffix":"hardBreakTrailing",start:{_bufferIndex:l?s:a.start._bufferIndex+s,_index:a.start._index+l,line:a.end.line,column:a.end.column-c,offset:a.end.offset-c},end:{...a.end}};a.end={...h.start},a.start.offset===a.end.offset?Object.assign(a,h):n.add(i,0,[["enter",h,t],["exit",h,t]])}i++}return n.consume(e),e}r(Us,"resolveAllLineSuffixes");var ni={};Wi(ni,{attentionMarkers:()=>Ys,contentInitial:()=>js,disable:()=>Zs,document:()=>Ws,flow:()=>Gs,flowInitial:()=>Vs,insideSpan:()=>Js,string:()=>Qs,text:()=>Ks});var Ws={42:se,43:se,45:se,48:se,49:se,50:se,51:se,52:se,53:se,54:se,55:se,56:se,57:se,62:En},js={91:Qr},Vs={[-2]:Jt,[-1]:Jt,32:Jt},Gs={35:Jr,42:ut,45:[Rn,ut],60:Zr,61:Rn,95:ut,96:Dn,126:Dn},Qs={38:Ln,92:In},Ks={[-5]:Xt,[-4]:Xt,[-3]:Xt,33:ei,38:Ln,42:Qt,60:[jr,Xr],91:ti,92:[Kr,In],93:ct,95:Qt,96:Vr},Js={null:[Qt,ra]},Ys={null:[42,95]},Zs={null:[]};function sa(e,t,n){let i={_bufferIndex:-1,_index:0,line:n&&n.line||1,column:n&&n.column||1,offset:n&&n.offset||0},a={},o=[],l=[],s=[],c=!0,u={attempt:W(F),check:W(N),consume:P,enter:$,exit:y,interrupt:W(N,{interrupt:!0})},h={code:null,containerState:{},defineSkip:w,events:[],now:T,parser:e,previous:null,sliceSerialize:b,sliceStream:E,write:p},f=t.tokenize.call(h,u),d;return t.resolveAll&&o.push(t),h;function p(I){return l=le(l,I),S(),l[l.length-1]!==null?[]:(x(t,0),h.events=Ge(o,h.events,h),h.events)}r(p,"write");function b(I,H){return ec(E(I),H)}r(b,"sliceSerialize");function E(I){return Xs(l,I)}r(E,"sliceStream");function T(){let{_bufferIndex:I,_index:H,line:B,column:J,offset:te}=i;return{_bufferIndex:I,_index:H,line:B,column:J,offset:te}}r(T,"now");function w(I){a[I.line]=I.column,O()}r(w,"defineSkip");function S(){for(;i._index<l.length;){let I=l[i._index];if(typeof I=="string"){let H=i._index;for(i._bufferIndex<0&&(i._bufferIndex=0);i._index===H&&i._bufferIndex<I.length;)_(I.charCodeAt(i._bufferIndex))}else _(I)}}r(S,"main");function _(I){c=void 0,d=I,f=f(I)}r(_,"go");function P(I){C(I)?(i.line++,i.column=1,i.offset+=I===-3?2:1,O()):I!==-1&&(i.column++,i.offset++),i._bufferIndex<0?i._index++:(i._bufferIndex++,i._bufferIndex===l[i._index].length&&(i._bufferIndex=-1,i._index++)),h.previous=I,c=!0}r(P,"consume");function $(I,H){let B=H||{};return B.type=I,B.start=T(),h.events.push(["enter",B,h]),s.push(B),B}r($,"enter");function y(I){let H=s.pop();return H.end=T(),h.events.push(["exit",H,h]),H}r(y,"exit");function F(I,H){x(I,H.from)}r(F,"onsuccessfulconstruct");function N(I,H){H.restore()}r(N,"onsuccessfulcheck");function W(I,H){return B;function B(J,te,ye){let _e,m,be,De;return Array.isArray(J)?de(J):"tokenize"in J?de([J]):g(J);function g(oe){return Pt;function Pt(Fe){let gt=Fe!==null&&oe[Fe],Ye=Fe!==null&&oe.null,cr=[...Array.isArray(gt)?gt:gt?[gt]:[],...Array.isArray(Ye)?Ye:Ye?[Ye]:[]];return de(cr)(Fe)}}function de(oe){return _e=oe,m=0,oe.length===0?ye:mt(oe[m])}function mt(oe){return Pt;function Pt(Fe){return De=z(),be=oe,oe.partial||(h.currentConstruct=oe),oe.name&&h.parser.constructs.disable.null.includes(oe.name)?on(Fe):oe.tokenize.call(H?Object.assign(Object.create(h),H):h,u,rn,on)(Fe)}}function rn(oe){return c=!0,I(be,De),te}function on(oe){return c=!0,De.restore(),++m<_e.length?mt(_e[m]):ye}}}r(W,"constructFactory");function x(I,H){I.resolveAll&&!o.includes(I)&&o.push(I),I.resolve&&re(h.events,H,h.events.length-H,I.resolve(h.events.slice(H),h)),I.resolveTo&&(h.events=I.resolveTo(h.events,h))}r(x,"addResult");function z(){let I=T(),H=h.previous,B=h.currentConstruct,J=h.events.length,te=Array.from(s);return{from:J,restore:ye};function ye(){i=I,h.previous=H,h.currentConstruct=B,h.events.length=J,s=te,O()}}r(z,"store");function O(){i.line in a&&i.column<2&&(i.column=a[i.line],i.offset+=a[i.line]-1)}r(O,"accountForPotentialSkip")}r(sa,"createTokenizer");function Xs(e,t){let n=t.start._index,i=t.start._bufferIndex,a=t.end._index,o=t.end._bufferIndex,l;if(n===a)l=[e[n].slice(i,o)];else{if(l=e.slice(n,a),i>-1){let s=l[0];typeof s=="string"?l[0]=s.slice(i):l.shift()}o>0&&l.push(e[a].slice(0,o))}return l}r(Xs,"sliceChunks");function ec(e,t){let n=-1,i=[],a;for(;++n<e.length;){let o=e[n],l;if(typeof o=="string")l=o;else switch(o){case-5:{l="\r";break}case-4:{l=`
`;break}case-3:{l=`\r
`;break}case-2:{l=t?" ":"	";break}case-1:{if(!t&&a)continue;l=" ";break}default:l=String.fromCharCode(o)}a=o===-2,i.push(l)}return i.join("")}r(ec,"serializeChunks");function Bn(e){let i={constructs:An([ni,...(e||{}).extensions||[]]),content:a(Yo),defined:[],document:a(ea),flow:a(na),lazy:{},string:a(ia),text:a(oa)};return i;function a(o){return l;function l(s){return sa(i,o,s)}}}r(Bn,"parse");function Nn(e){for(;!Fn(e););return e}r(Nn,"postprocess");var ca=/[\0\t\n\r]/g;function Mn(){let e=1,t="",n=!0,i;return a;function a(o,l,s){o=t+(typeof o=="string"?o.toString():new TextDecoder(l||void 0).decode(o));let c=[],u=0;for(t="",n&&(o.charCodeAt(0)===65279&&u++,n=void 0);u<o.length;){ca.lastIndex=u;let h=ca.exec(o),f=h&&h.index!==void 0?h.index:o.length,d=o.charCodeAt(f);if(!h){t=o.slice(u);break}if(d===10&&u===f&&i)c.push(-3),i=void 0;else switch(i&&(c.push(-5),i=void 0),u<f&&(c.push(o.slice(u,f)),e+=f-u),d){case 0:{c.push(65533),e++;break}case 9:{let p=Math.ceil(e/4)*4;for(c.push(-2);e++<p;)c.push(-1);break}case 10:{c.push(-4),e=1;break}default:i=!0,e=1}u=f+1}return s&&(i&&c.push(-5),t&&c.push(t),c.push(null)),c}}r(Mn,"preprocess");var nc=/\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;function ri(e){return e.replace(nc,rc)}r(ri,"decodeString");function rc(e,t,n){if(t)return t;if(n.charCodeAt(0)===35){let a=n.charCodeAt(1),o=a===120||a===88;return Vt(n.slice(o?2:1),o?16:10)}return ot(n)||e}r(rc,"decode");function It(e){return!e||typeof e!="object"?"":"position"in e||"type"in e?ua(e.position):"start"in e||"end"in e?ua(e):"line"in e||"column"in e?ii(e):""}r(It,"stringifyPosition");function ii(e){return fa(e&&e.line)+":"+fa(e&&e.column)}r(ii,"point");function ua(e){return ii(e&&e.start)+"-"+ii(e&&e.end)}r(ua,"position");function fa(e){return e&&typeof e=="number"?e:1}r(fa,"index");var pa={}.hasOwnProperty;function oi(e,t,n){return t&&typeof t=="object"&&(n=t,t=void 0),ic(n)(Nn(Bn(n).document().write(Mn()(e,t,!0))))}r(oi,"fromMarkdown");function ic(e){let t={afterExit:[],beforeEnter:[],transforms:[],canContainEols:["emphasis","fragment","heading","paragraph","strong"],enter:{autolink:l(Mi),autolinkProtocol:x,autolinkEmail:x,atxHeading:l(Ri),blockQuote:l(gt),characterEscape:x,characterReference:x,codeFenced:l(Ye),codeFencedFenceInfo:s,codeFencedFenceMeta:s,codeIndented:l(Ye,s),codeText:l(cr,s),codeTextData:x,data:x,codeFlowValue:x,definition:l(tl),definitionDestinationString:s,definitionLabelString:s,definitionTitleString:s,emphasis:l(nl),hardBreakEscape:l(Bi),hardBreakTrailing:l(Bi),htmlFlow:l(Ni,s),htmlFlowData:x,htmlText:l(Ni,s),htmlTextData:x,image:l(rl),label:s,link:l(Mi),listItem:l(il),listItemValue:p,listOrdered:l(Oi,d),listUnordered:l(Oi),paragraph:l(ol),reference:de,referenceString:s,resourceDestinationString:s,resourceTitleString:s,setextHeading:l(Ri),strong:l(al),thematicBreak:l(sl)},exit:{atxHeading:u(),atxHeadingSequence:y,autolink:u(),autolinkEmail:Fe,autolinkProtocol:Pt,blockQuote:u(),characterEscapeValue:z,characterReferenceMarkerHexadecimal:rn,characterReferenceMarkerNumeric:rn,characterReferenceValue:on,characterReference:oe,codeFenced:u(w),codeFencedFence:T,codeFencedFenceInfo:b,codeFencedFenceMeta:E,codeFlowValue:z,codeIndented:u(S),codeText:u(J),codeTextData:z,data:z,definition:u(),definitionDestinationString:$,definitionLabelString:_,definitionTitleString:P,emphasis:u(),hardBreakEscape:u(I),hardBreakTrailing:u(I),htmlFlow:u(H),htmlFlowData:z,htmlText:u(B),htmlTextData:z,image:u(ye),label:m,labelText:_e,lineEnding:O,link:u(te),listItem:u(),listOrdered:u(),listUnordered:u(),paragraph:u(),referenceString:mt,resourceDestinationString:be,resourceTitleString:De,resource:g,setextHeading:u(W),setextHeadingLineSequence:N,setextHeadingText:F,strong:u(),thematicBreak:u()}};da(t,(e||{}).mdastExtensions||[]);let n={};return i;function i(k){let v={type:"root",children:[],position:void 0},q={stack:[v],tokenStack:[],config:t,enter:c,exit:h,buffer:s,resume:f,data:n},R=[],fe=[],G=-1;for(;++G<k.length;)if(fe.push(k[G]),k[G][1].type==="listOrdered"||k[G][1].type==="listUnordered")if(k[G][0]==="enter")R.push(fe.length-1);else{let he=R.pop();o(fe,he)}for(k=fe,G=-1;++G<k.length;){let he=t[k[G][0]];k[G][0]==="enter"&&t.beforeEnter.length>0&&a(t.beforeEnter,{...q,sliceSerialize:k[G][2].sliceSerialize},k[G][1]),pa.call(he,k[G][1].type)&&he[k[G][1].type].call({...q,sliceSerialize:k[G][2].sliceSerialize},k[G][1]),k[G][0]==="exit"&&t.afterExit.length>0&&a(t.afterExit,{...q,sliceSerialize:k[G][2].sliceSerialize},k[G][1])}if(q.tokenStack.length>0){let he=q.tokenStack[q.tokenStack.length-1];(he[1]||ha).call(q,void 0,he[0])}for(v.position={start:Qe(k.length>0?k[0][1].start:{line:1,column:1,offset:0}),end:Qe(k.length>0?k[k.length-2][1].end:{line:1,column:1,offset:0})},G=-1;++G<t.transforms.length;)v=t.transforms[G](v)||v;return v}function a(k,v,q){let R=-1;for(;++R<k.length;)k[R].call(v,q)}function o(k,v){let q=k.length-1,R=v-1,fe=-1,G=!1,he,Se,$t,zt,qt=[];for(;++R<=q;){let me=k[R];switch(me[1].type){case"listUnordered":case"listOrdered":case"blockQuote":{me[0]==="enter"?fe++:fe--,zt=void 0;break}case"lineEndingBlank":{me[0]==="enter"&&(he&&!zt&&!fe&&!$t&&($t=R),zt=void 0);break}case"linePrefix":case"listItemValue":case"listItemMarker":case"listItemPrefix":case"listItemPrefixWhitespace":break;default:zt=void 0}if(!fe&&me[0]==="enter"&&me[1].type==="listItemPrefix"||fe===-1&&me[0]==="exit"&&(me[1].type==="listUnordered"||me[1].type==="listOrdered")){if(he){let xt=R;for(Se=void 0;xt--;){let Pe=k[xt];if(Pe[1].type==="lineEnding"||Pe[1].type==="lineEndingBlank"){if(Pe[0]==="exit")continue;Se&&(k[Se][1].type="lineEndingBlank",G=!0),Pe[1].type="lineEnding",Se=xt}else if(!(Pe[1].type==="linePrefix"||Pe[1].type==="blockQuotePrefix"||Pe[1].type==="blockQuotePrefixWhitespace"||Pe[1].type==="blockQuoteMarker"||Pe[1].type==="listItemIndent"))break}$t&&(!Se||$t<Se)&&(he._spread=!0),he.end=Object.assign({},Se?k[Se][1].start:me[1].end),qt.push({at:Se||R,event:["exit",he,me[2]]})}if(me[1].type==="listItemPrefix"){let xt={type:"listItem",_spread:!1,start:Object.assign({},me[1].start),end:void 0};he=xt,qt.push({at:R,event:["enter",xt,me[2]]}),$t=void 0,zt=!0}}}let Hi=k.splice(v),ur=0;for(R=-1;++R<Hi.length;){for(;ur<qt.length&&qt[ur].at===v+R;)k.push(qt[ur++].event);k.push(Hi[R])}k[v][1]._spread=G}function l(k,v){return q;function q(R){c.call(this,k(R),R),v&&v.call(this,R)}}function s(){this.stack.push({type:"fragment",children:[]})}function c(k,v,q){this.stack[this.stack.length-1].children.push(k),this.stack.push(k),this.tokenStack.push([v,q||void 0]),k.position={start:Qe(v.start),end:void 0}}function u(k){return v;function v(q){k&&k.call(this,q),h.call(this,q)}}function h(k,v){let q=this.stack.pop(),R=this.tokenStack.pop();if(!R)throw new Error("Cannot close `"+k.type+"` ("+It({start:k.start,end:k.end})+"): it\u2019s not open");R[0].type!==k.type&&(v?v.call(this,k,R[0]):(R[1]||ha).call(this,k,R[0])),q.position.end=Qe(k.end)}function f(){return Et(this.stack.pop())}function d(){this.data.expectingFirstListItemValue=!0}function p(k){if(this.data.expectingFirstListItemValue){let v=this.stack[this.stack.length-2];v.start=Number.parseInt(this.sliceSerialize(k),10),this.data.expectingFirstListItemValue=void 0}}function b(){let k=this.resume(),v=this.stack[this.stack.length-1];v.lang=k}function E(){let k=this.resume(),v=this.stack[this.stack.length-1];v.meta=k}function T(){this.data.flowCodeInside||(this.buffer(),this.data.flowCodeInside=!0)}function w(){let k=this.resume(),v=this.stack[this.stack.length-1];v.value=k.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g,""),this.data.flowCodeInside=void 0}function S(){let k=this.resume(),v=this.stack[this.stack.length-1];v.value=k.replace(/(\r?\n|\r)$/g,"")}function _(k){let v=this.resume(),q=this.stack[this.stack.length-1];q.label=v,q.identifier=ie(this.sliceSerialize(k)).toLowerCase()}function P(){let k=this.resume(),v=this.stack[this.stack.length-1];v.title=k}function $(){let k=this.resume(),v=this.stack[this.stack.length-1];v.url=k}function y(k){let v=this.stack[this.stack.length-1];if(!v.depth){let q=this.sliceSerialize(k).length;v.depth=q}}function F(){this.data.setextHeadingSlurpLineEnding=!0}function N(k){let v=this.stack[this.stack.length-1];v.depth=this.sliceSerialize(k).codePointAt(0)===61?1:2}function W(){this.data.setextHeadingSlurpLineEnding=void 0}function x(k){let q=this.stack[this.stack.length-1].children,R=q[q.length-1];(!R||R.type!=="text")&&(R=ll(),R.position={start:Qe(k.start),end:void 0},q.push(R)),this.stack.push(R)}function z(k){let v=this.stack.pop();v.value+=this.sliceSerialize(k),v.position.end=Qe(k.end)}function O(k){let v=this.stack[this.stack.length-1];if(this.data.atHardBreak){let q=v.children[v.children.length-1];q.position.end=Qe(k.end),this.data.atHardBreak=void 0;return}!this.data.setextHeadingSlurpLineEnding&&t.canContainEols.includes(v.type)&&(x.call(this,k),z.call(this,k))}function I(){this.data.atHardBreak=!0}function H(){let k=this.resume(),v=this.stack[this.stack.length-1];v.value=k}function B(){let k=this.resume(),v=this.stack[this.stack.length-1];v.value=k}function J(){let k=this.resume(),v=this.stack[this.stack.length-1];v.value=k}function te(){let k=this.stack[this.stack.length-1];if(this.data.inReference){let v=this.data.referenceType||"shortcut";k.type+="Reference",k.referenceType=v,delete k.url,delete k.title}else delete k.identifier,delete k.label;this.data.referenceType=void 0}function ye(){let k=this.stack[this.stack.length-1];if(this.data.inReference){let v=this.data.referenceType||"shortcut";k.type+="Reference",k.referenceType=v,delete k.url,delete k.title}else delete k.identifier,delete k.label;this.data.referenceType=void 0}function _e(k){let v=this.sliceSerialize(k),q=this.stack[this.stack.length-2];q.label=ri(v),q.identifier=ie(v).toLowerCase()}function m(){let k=this.stack[this.stack.length-1],v=this.resume(),q=this.stack[this.stack.length-1];if(this.data.inReference=!0,q.type==="link"){let R=k.children;q.children=R}else q.alt=v}function be(){let k=this.resume(),v=this.stack[this.stack.length-1];v.url=k}function De(){let k=this.resume(),v=this.stack[this.stack.length-1];v.title=k}function g(){this.data.inReference=void 0}function de(){this.data.referenceType="collapsed"}function mt(k){let v=this.resume(),q=this.stack[this.stack.length-1];q.label=v,q.identifier=ie(this.sliceSerialize(k)).toLowerCase(),this.data.referenceType="full"}function rn(k){this.data.characterReferenceType=k.type}function on(k){let v=this.sliceSerialize(k),q=this.data.characterReferenceType,R;q?(R=Vt(v,q==="characterReferenceMarkerNumeric"?10:16),this.data.characterReferenceType=void 0):R=ot(v);let fe=this.stack[this.stack.length-1];fe.value+=R}function oe(k){let v=this.stack.pop();v.position.end=Qe(k.end)}function Pt(k){z.call(this,k);let v=this.stack[this.stack.length-1];v.url=this.sliceSerialize(k)}function Fe(k){z.call(this,k);let v=this.stack[this.stack.length-1];v.url="mailto:"+this.sliceSerialize(k)}function gt(){return{type:"blockquote",children:[],position:void 0}}function Ye(){return{type:"code",lang:null,meta:null,value:"",position:void 0}}function cr(){return{type:"inlineCode",value:"",position:void 0}}function tl(){return{type:"definition",identifier:"",label:null,title:null,url:"",position:void 0}}function nl(){return{type:"emphasis",children:[],position:void 0}}function Ri(){return{type:"heading",depth:0,children:[],position:void 0}}function Bi(){return{type:"break",position:void 0}}function Ni(){return{type:"html",value:"",position:void 0}}function rl(){return{type:"image",title:null,url:"",alt:null,position:void 0}}function Mi(){return{type:"link",title:null,url:"",children:[],position:void 0}}function Oi(k){return{type:"list",ordered:k.type==="listOrdered",start:null,spread:k._spread,children:[],position:void 0}}function il(k){return{type:"listItem",spread:k._spread,checked:null,children:[],position:void 0}}function ol(){return{type:"paragraph",children:[],position:void 0}}function al(){return{type:"strong",children:[],position:void 0}}function ll(){return{type:"text",value:"",position:void 0}}function sl(){return{type:"thematicBreak",position:void 0}}}r(ic,"compiler");function Qe(e){return{line:e.line,column:e.column,offset:e.offset}}r(Qe,"point");function da(e,t){let n=-1;for(;++n<t.length;){let i=t[n];Array.isArray(i)?da(e,i):oc(e,i)}}r(da,"configure");function oc(e,t){let n;for(n in t)if(pa.call(t,n))switch(n){case"canContainEols":{let i=t[n];i&&e[n].push(...i);break}case"transforms":{let i=t[n];i&&e[n].push(...i);break}case"afterExit":case"beforeEnter":{let i=t[n];i&&e[n].push(i);break}case"enter":case"exit":{let i=t[n];i&&Object.assign(e[n],i);break}}}r(oc,"extension");function ha(e,t){throw e?new Error("Cannot close `"+e.type+"` ("+It({start:e.start,end:e.end})+"): a different token (`"+t.type+"`, "+It({start:t.start,end:t.end})+") is open"):new Error("Cannot close document, a token (`"+t.type+"`, "+It({start:t.start,end:t.end})+") is still open")}r(ha,"defaultOnError");function ai(e,t){let n=String(e);if(typeof t!="string")throw new TypeError("Expected character");let i=0,a=n.indexOf(t);for(;a!==-1;)i++,a=n.indexOf(t,a+t.length);return i}r(ai,"ccount");function li(e){if(typeof e!="string")throw new TypeError("Expected a string");return e.replace(/[|\\{}()[\]^$+*?.]/g,"\\$&").replace(/-/g,"\\x2d")}r(li,"escapeStringRegexp");var Ke=r((function(e){if(e==null)return cc;if(typeof e=="function")return On(e);if(typeof e=="object")return Array.isArray(e)?ac(e):lc(e);if(typeof e=="string")return sc(e);throw new Error("Expected function, string, or object as test")}),"convert");function ac(e){let t=[],n=-1;for(;++n<e.length;)t[n]=Ke(e[n]);return On(i);function i(...a){let o=-1;for(;++o<t.length;)if(t[o].apply(this,a))return!0;return!1}}r(ac,"anyFactory");function lc(e){let t=e;return On(n);function n(i){let a=i,o;for(o in e)if(a[o]!==t[o])return!1;return!0}}r(lc,"propertiesFactory");function sc(e){return On(t);function t(n){return n&&n.type===e}}r(sc,"typeFactory");function On(e){return t;function t(n,i,a){return!!(uc(n)&&e.call(this,n,typeof i=="number"?i:void 0,a||void 0))}}r(On,"castFactory");function cc(){return!0}r(cc,"ok");function uc(e){return e!==null&&typeof e=="object"&&"type"in e}r(uc,"looksLikeANode");var ma=[],Hn=!0,Lt=!1,Un="skip";function Wn(e,t,n,i){let a;typeof t=="function"&&typeof n!="function"?(i=n,n=t):a=t;let o=Ke(a),l=i?-1:1;s(e,void 0,[])();function s(c,u,h){let f=c&&typeof c=="object"?c:{};if(typeof f.type=="string"){let p=typeof f.tagName=="string"?f.tagName:typeof f.name=="string"?f.name:void 0;Object.defineProperty(d,"name",{value:"node ("+(c.type+(p?"<"+p+">":""))+")"})}return d;function d(){let p=ma,b,E,T;if((!t||o(c,u,h[h.length-1]||void 0))&&(p=fc(n(c,h)),p[0]===Lt))return p;if("children"in c&&c.children){let w=c;if(w.children&&p[0]!==Un)for(E=(i?w.children.length:-1)+l,T=h.concat(w);E>-1&&E<w.children.length;){let S=w.children[E];if(b=s(S,E,T)(),b[0]===Lt)return b;E=typeof b[1]=="number"?b[1]:E+l}}return p}}r(s,"factory")}r(Wn,"visitParents");function fc(e){return Array.isArray(e)?e:typeof e=="number"?[Hn,e]:e==null?ma:[e]}r(fc,"toResult");function si(e,t,n){let a=Ke((n||{}).ignore||[]),o=hc(t),l=-1;for(;++l<o.length;)Wn(e,"text",s);function s(u,h){let f=-1,d;for(;++f<h.length;){let p=h[f],b=d?d.children:void 0;if(a(p,b?b.indexOf(p):void 0,d))return;d=p}if(d)return c(u,h)}r(s,"visitor");function c(u,h){let f=h[h.length-1],d=o[l][0],p=o[l][1],b=0,T=f.children.indexOf(u),w=!1,S=[];d.lastIndex=0;let _=d.exec(u.value);for(;_;){let $=_.index,y={index:_.index,input:_.input,stack:[...h,u]},F=p(..._,y);if(typeof F=="string"&&(F=F.length>0?{type:"text",value:F}:void 0),F===!1)d.lastIndex=$+1;else{if(b!==$&&P({type:"text",value:u.value.slice(b,$)}),Array.isArray(F))for(let N of F)P(N);else F&&P(F);b=$+_[0].length,w=!0}if(!d.global)break;_=d.exec(u.value)}return w?(b<u.value.length&&P({type:"text",value:u.value.slice(b)}),f.children.splice(T,1,...S)):S=[u],T+S.length;function P($){let y=S[S.length-1];y&&y.type==="text"&&$.type==="text"?y.value+=$.value:S.push($)}r(P,"add")}r(c,"handler")}r(si,"findAndReplace");function hc(e){if(!Array.isArray(e))throw new TypeError("Expected find and replace tuple or list of tuples");let t=[],n=!e[0]||Array.isArray(e[0])?e:[e],i=-1;for(;++i<n.length;){let a=n[i];t.push([pc(a[0]),dc(a[1])])}return t}r(hc,"toPairs");function pc(e){return typeof e=="string"?new RegExp(li(e),"g"):e}r(pc,"toExpression");function dc(e){return typeof e=="function"?e:function(){return e}}r(dc,"toFunction");function fi(){return{transforms:[wc],enter:{literalAutolink:mc,literalAutolinkEmail:ci,literalAutolinkHttp:ci,literalAutolinkWww:ci},exit:{literalAutolink:kc,literalAutolinkEmail:bc,literalAutolinkHttp:gc,literalAutolinkWww:xc}}}r(fi,"gfmAutolinkLiteralFromMarkdown");function mc(e){this.enter({type:"link",title:null,url:"",children:[]},e)}r(mc,"enterLiteralAutolink");function ci(e){this.config.enter.autolinkProtocol.call(this,e)}r(ci,"enterLiteralAutolinkValue");function gc(e){this.config.exit.autolinkProtocol.call(this,e)}r(gc,"exitLiteralAutolinkHttp");function xc(e){this.config.exit.data.call(this,e);let t=this.stack[this.stack.length-1];t.type,t.url="http://"+this.sliceSerialize(e)}r(xc,"exitLiteralAutolinkWww");function bc(e){this.config.exit.autolinkEmail.call(this,e)}r(bc,"exitLiteralAutolinkEmail");function kc(e){this.exit(e)}r(kc,"exitLiteralAutolink");function wc(e){si(e,[[/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi,yc],[/(?<=^|\s|\p{P}|\p{S})([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/gu,vc]],{ignore:["link","linkReference"]})}r(wc,"transformGfmAutolinkLiterals");function yc(e,t,n,i,a){let o="";if(!ga(a)||(/^w/i.test(t)&&(n=t+n,t="",o="http://"),!_c(n)))return!1;let l=Sc(n+i);if(!l[0])return!1;let s={type:"link",title:null,url:o+t+l[0],children:[{type:"text",value:t+l[0]}]};return l[1]?[s,{type:"text",value:l[1]}]:s}r(yc,"findUrl");function vc(e,t,n,i){return!ga(i,!0)||/[-\d_]$/.test(n)?!1:{type:"link",title:null,url:"mailto:"+t+"@"+n,children:[{type:"text",value:t+"@"+n}]}}r(vc,"findEmail");function _c(e){let t=e.split(".");return!(t.length<2||t[t.length-1]&&(/_/.test(t[t.length-1])||!/[a-zA-Z\d]/.test(t[t.length-1]))||t[t.length-2]&&(/_/.test(t[t.length-2])||!/[a-zA-Z\d]/.test(t[t.length-2])))}r(_c,"isCorrectDomain");function Sc(e){let t=/[!"&'),.:;<>?\]}]+$/.exec(e);if(!t)return[e,void 0];e=e.slice(0,t.index);let n=t[0],i=n.indexOf(")"),a=ai(e,"("),o=ai(e,")");for(;i!==-1&&a>o;)e+=n.slice(0,i+1),n=n.slice(i+1),i=n.indexOf(")"),o++;return[e,n]}r(Sc,"splitUrl");function ga(e,t){let n=e.input.charCodeAt(e.index-1);return(e.index===0||Ee(n)||lt(n))&&(!t||n!==47)}r(ga,"previous");zc.peek=$c;function Tc(){this.buffer()}r(Tc,"enterFootnoteCallString");function Ac(e){this.enter({type:"footnoteReference",identifier:"",label:""},e)}r(Ac,"enterFootnoteCall");function Ec(){this.buffer()}r(Ec,"enterFootnoteDefinitionLabelString");function Ic(e){this.enter({type:"footnoteDefinition",identifier:"",label:"",children:[]},e)}r(Ic,"enterFootnoteDefinition");function Lc(e){let t=this.resume(),n=this.stack[this.stack.length-1];n.type,n.identifier=ie(this.sliceSerialize(e)).toLowerCase(),n.label=t}r(Lc,"exitFootnoteCallString");function Dc(e){this.exit(e)}r(Dc,"exitFootnoteCall");function Fc(e){let t=this.resume(),n=this.stack[this.stack.length-1];n.type,n.identifier=ie(this.sliceSerialize(e)).toLowerCase(),n.label=t}r(Fc,"exitFootnoteDefinitionLabelString");function Pc(e){this.exit(e)}r(Pc,"exitFootnoteDefinition");function $c(){return"["}r($c,"footnoteReferencePeek");function zc(e,t,n,i){let a=n.createTracker(i),o=a.move("[^"),l=n.enter("footnoteReference"),s=n.enter("reference");return o+=a.move(n.safe(n.associationId(e),{after:"]",before:o})),s(),l(),o+=a.move("]"),o}r(zc,"footnoteReference");function hi(){return{enter:{gfmFootnoteCallString:Tc,gfmFootnoteCall:Ac,gfmFootnoteDefinitionLabelString:Ec,gfmFootnoteDefinition:Ic},exit:{gfmFootnoteCallString:Lc,gfmFootnoteCall:Dc,gfmFootnoteDefinitionLabelString:Fc,gfmFootnoteDefinition:Pc}}}r(hi,"gfmFootnoteFromMarkdown");xa.attention=Nc;xa.peek=Mc;function pi(){return{canContainEols:["delete"],enter:{strikethrough:Rc},exit:{strikethrough:Bc}}}r(pi,"gfmStrikethroughFromMarkdown");function Rc(e){this.enter({type:"delete",children:[],position:void 0},e)}r(Rc,"enterStrikethrough");function Bc(e){this.exit(e)}r(Bc,"exitStrikethrough");function xa(e,t,n,i){let a=n.createTracker(i),o=n.stack.includes("strikethrough")?"~":"~~",l=n.enter("strikethrough"),s=a.move(o);return s+=n.containerPhrasing(e,{...a.current(),before:s,after:"~"}),s+=a.move(o),l(),s}r(xa,"handleDelete");function Nc(){return{construct:"strikethrough",markers:["~"],sizes:[2,1]}}r(Nc,"attentionDelete");function Mc(){return"~"}r(Mc,"peekDelete");var di=Ke(["break","delete","emphasis","footnote","footnoteReference","image","imageReference","inlineCode","inlineMath","link","linkReference","mdxJsxTextElement","mdxTextExpression","strong","text","textDirective"]);var Yx={}.hasOwnProperty;var eb={}.hasOwnProperty;function en(e){let t=e.options.quote||'"';if(t!=='"'&&t!=="'")throw new Error("Cannot serialize title with `"+t+"` for `options.quote`, expected `\"`, or `'`");return t}r(en,"checkQuote");function ba(e){let t=e.options.emphasis||"*";if(t!=="*"&&t!=="_")throw new Error("Cannot serialize emphasis with `"+t+"` for `options.emphasis`, expected `*`, or `_`");return t}r(ba,"checkEmphasis");mi.attention=Wc;mi.peek=jc;function mi(e,t,n,i){let a=n.enter("phrasing"),o=n.containerPhrasing({type:"root",children:[e]},i);return a(),o}r(mi,"emphasis");function Wc(e,t){return{construct:"emphasis",markers:ba(t)==="*"?["*","_"]:["_","*"],sizes:[1]}}r(Wc,"attention");function jc(e,t,n){return n.options.emphasis||"*"}r(jc,"peek");wa.peek=Qc;function wa(e){return e.value||""}r(wa,"html");function Qc(){return"<"}r(Qc,"htmlPeek");ya.peek=Kc;function ya(e,t,n,i){let a=en(n),o=a==='"'?"Quote":"Apostrophe",l=n.enter("image"),s=n.enter("label"),c=n.createTracker(i),u=c.move("![");return u+=c.move(n.safe(e.alt,{before:u,after:"]",...c.current()})),u+=c.move("]("),s(),!e.url&&e.title||/[\0- \u007F]/.test(e.url)?(s=n.enter("destinationLiteral"),u+=c.move("<"),u+=c.move(n.safe(e.url,{before:u,after:">",...c.current()})),u+=c.move(">")):(s=n.enter("destinationRaw"),u+=c.move(n.safe(e.url,{before:u,after:e.title?" ":")",...c.current()}))),s(),e.title&&(s=n.enter(`title${o}`),u+=c.move(" "+a),u+=c.move(n.safe(e.title,{before:u,after:a,...c.current()})),u+=c.move(a),s()),u+=c.move(")"),l(),u}r(ya,"image");function Kc(){return"!"}r(Kc,"imagePeek");va.peek=Jc;function va(e,t,n,i){let a=e.referenceType,o=n.enter("imageReference"),l=n.enter("label"),s=n.createTracker(i),c=s.move("!["),u=n.safe(e.alt,{before:c,after:"]",...s.current()});c+=s.move(u+"]["),l();let h=n.stack;n.stack=h.filter(function(d){return d!=="phrasing"}),l=n.enter("reference");let f=n.safe(n.associationId(e),{before:c,after:"]",...s.current()});return l(),n.stack=h,o(),a==="full"||!u||u!==f?c+=s.move(f+"]"):a==="shortcut"?c=c.slice(0,-1):c+=s.move("]"),c}r(va,"imageReference");function Jc(){return"!"}r(Jc,"imageReferencePeek");_a.peek=Yc;function _a(e,t,n){let i=e.value||"",a="`",o=-1;for(;new RegExp("(^|[^`])"+a+"([^`]|$)").test(i);)a+="`";for(/[^\n\r ]/.test(i)&&(/^[\n\r ]/.test(i)&&/[\n\r ]$/.test(i)||/^`|`$/.test(i))&&(i=" "+i+" ");++o<n.unsafe.length;){let l=n.unsafe[o],s=n.compilePattern(l);if(!l.atBreak)continue;let c;for(;c=s.exec(i);){let u=c.index;i.charCodeAt(u)===10&&i.charCodeAt(u-1)===13&&u--,i=i.slice(0,u)+" "+i.slice(c.index+1)}}return a+i+a}r(_a,"inlineCode");function Yc(){return"`"}r(Yc,"inlineCodePeek");function gi(e,t){let n=Et(e);return!!(!t.options.resourceLink&&e.url&&!e.title&&e.children&&e.children.length===1&&e.children[0].type==="text"&&(n===e.url||"mailto:"+n===e.url)&&/^[a-z][+\-.a-z]+:/i.test(e.url)&&!/[\0- <>\u007F]/.test(e.url))}r(gi,"formatLinkAsAutolink");Sa.peek=Zc;function Sa(e,t,n,i){let a=en(n),o=a==='"'?"Quote":"Apostrophe",l=n.createTracker(i);if(gi(e,n)){let h=n.stack;n.stack=h.filter(function(p){return p!=="phrasing"});let f=n.enter("autolink"),d=l.move("<");return d+=l.move(n.containerPhrasing(e,{before:d,after:">",...l.current()})),d+=l.move(">"),f(),n.stack=h,d}let s=n.enter("link"),c=n.enter("label"),u=l.move("[");return u+=l.move(n.containerPhrasing(e,{before:u,after:"](",...l.current()})),u+=l.move("]("),c(),!e.url&&e.title||/[\0- \u007F]/.test(e.url)?(c=n.enter("destinationLiteral"),u+=l.move("<"),u+=l.move(n.safe(e.url,{before:u,after:">",...l.current()})),u+=l.move(">")):(c=n.enter("destinationRaw"),u+=l.move(n.safe(e.url,{before:u,after:e.title?" ":")",...l.current()}))),c(),e.title&&(c=n.enter(`title${o}`),u+=l.move(" "+a),u+=l.move(n.safe(e.title,{before:u,after:a,...l.current()})),u+=l.move(a),c()),u+=l.move(")"),s(),u}r(Sa,"link");function Zc(e,t,n){return gi(e,n)?"<":"["}r(Zc,"linkPeek");Ca.peek=Xc;function Ca(e,t,n,i){let a=e.referenceType,o=n.enter("linkReference"),l=n.enter("label"),s=n.createTracker(i),c=s.move("["),u=n.containerPhrasing(e,{before:c,after:"]",...s.current()});c+=s.move(u+"]["),l();let h=n.stack;n.stack=h.filter(function(d){return d!=="phrasing"}),l=n.enter("reference");let f=n.safe(n.associationId(e),{before:c,after:"]",...s.current()});return l(),n.stack=h,o(),a==="full"||!u||u!==f?c+=s.move(f+"]"):a==="shortcut"?c=c.slice(0,-1):c+=s.move("]"),c}r(Ca,"linkReference");function Xc(){return"["}r(Xc,"linkReferencePeek");function Aa(e){let t=e.options.strong||"*";if(t!=="*"&&t!=="_")throw new Error("Cannot serialize strong with `"+t+"` for `options.strong`, expected `*`, or `_`");return t}r(Aa,"checkStrong");xi.attention=tu;xi.peek=nu;function xi(e,t,n,i){let a=n.enter("phrasing"),o=n.containerPhrasing({type:"root",children:[e]},i);return a(),o}r(xi,"strong");function tu(e,t){return{construct:"strong",markers:Aa(t)==="*"?["*","_"]:["_","*"],sizes:[2]}}r(tu,"attention");function nu(e,t,n){return n.options.strong||"*"}r(nu,"peek");var ft=["autolink","destinationLiteral","destinationRaw","reference","titleQuote","titleApostrophe"],Ia=[{character:"	",after:"[\\r\\n]",inConstruct:"phrasing"},{character:"	",before:"[\\r\\n]",inConstruct:"phrasing"},{character:"	",inConstruct:["codeFencedLangGraveAccent","codeFencedLangTilde"]},{character:"\r",inConstruct:["codeFencedLangGraveAccent","codeFencedLangTilde","codeFencedMetaGraveAccent","codeFencedMetaTilde","destinationLiteral","headingAtx"]},{character:`
`,inConstruct:["codeFencedLangGraveAccent","codeFencedLangTilde","codeFencedMetaGraveAccent","codeFencedMetaTilde","destinationLiteral","headingAtx"]},{character:"\r",before:"[\\r\\n]",inConstruct:"phrasing"},{character:"\r",after:"\\r",inConstruct:"phrasing"},{character:`
`,before:"\\n",inConstruct:"phrasing"},{character:`
`,after:"[\\r\\n]",inConstruct:"phrasing"},{character:" ",after:"[\\r\\n]",inConstruct:"phrasing"},{character:" ",before:"[\\r\\n]",inConstruct:"phrasing"},{character:" ",inConstruct:["codeFencedLangGraveAccent","codeFencedLangTilde"]},{character:"!",after:"\\[",inConstruct:"phrasing",notInConstruct:ft},{character:'"',inConstruct:"titleQuote"},{atBreak:!0,character:"#"},{character:"#",inConstruct:"headingAtx",after:`(?:[\r
]|$)`},{character:"&",after:"[#A-Za-z]",inConstruct:"phrasing"},{character:"'",inConstruct:"titleApostrophe"},{character:"(",inConstruct:"destinationRaw"},{before:"\\]",character:"(",inConstruct:"phrasing",notInConstruct:ft},{atBreak:!0,before:"\\d+",character:")"},{character:")",inConstruct:"destinationRaw"},{atBreak:!0,character:"*",after:`(?:[ 	\r
*])`},{character:"*",inConstruct:"phrasing",notInConstruct:ft},{atBreak:!0,character:"+",after:`(?:[ 	\r
])`},{atBreak:!0,character:"-",after:`(?:[ 	\r
-])`},{atBreak:!0,before:"\\d+",character:".",after:`(?:[ 	\r
]|$)`},{atBreak:!0,character:"<",after:"[!/?A-Za-z]"},{character:"<",after:"[!/?A-Za-z]",inConstruct:"phrasing",notInConstruct:ft},{character:"<",inConstruct:"destinationLiteral"},{atBreak:!0,character:"="},{atBreak:!0,character:">"},{character:">",inConstruct:"destinationLiteral"},{atBreak:!0,character:"["},{character:"[",inConstruct:"phrasing",notInConstruct:ft},{character:"[",inConstruct:["label","reference"]},{character:"\\",after:"[\\r\\n]",inConstruct:"phrasing"},{character:"]",inConstruct:["label","reference"]},{atBreak:!0,character:"_"},{character:"_",inConstruct:"phrasing",notInConstruct:ft},{atBreak:!0,character:"`"},{character:"`",inConstruct:["codeFencedLangGraveAccent","codeFencedMetaGraveAccent"]},{character:"`",inConstruct:"phrasing",notInConstruct:ft},{atBreak:!0,character:"~"},{character:"<",inConstruct:"autolink"},{character:">",inConstruct:"autolink"},{character:"\x7F",inConstruct:"autolink"}],Ea=-1;for(;++Ea<33;)Ia.push({character:String.fromCharCode(Ea),inConstruct:"autolink"});var xy={}.hasOwnProperty;function wi(){return{enter:{table:iu,tableData:La,tableHeader:La,tableRow:au},exit:{codeText:lu,table:ou,tableData:ki,tableHeader:ki,tableRow:ki}}}r(wi,"gfmTableFromMarkdown");function iu(e){let t=e._align;this.enter({type:"table",align:t.map(function(n){return n==="none"?null:n}),children:[]},e),this.data.inTable=!0}r(iu,"enterTable");function ou(e){this.exit(e),this.data.inTable=void 0}r(ou,"exitTable");function au(e){this.enter({type:"tableRow",children:[]},e)}r(au,"enterRow");function ki(e){this.exit(e)}r(ki,"exit");function La(e){this.enter({type:"tableCell",children:[]},e)}r(La,"enterCell");function lu(e){let t=this.resume();this.data.inTable&&(t=t.replace(/\\([\\|])/g,su));let n=this.stack[this.stack.length-1];n.type,n.value=t,this.exit(e)}r(lu,"exitCodeText");function su(e,t){return t==="|"?t:e}r(su,"replace");function yi(){return{exit:{taskListCheckValueChecked:Da,taskListCheckValueUnchecked:Da,paragraph:uu}}}r(yi,"gfmTaskListItemFromMarkdown");function Da(e){let t=this.stack[this.stack.length-2];t.type,t.checked=e.type==="taskListCheckValueChecked"}r(Da,"exitCheck");function uu(e){let t=this.stack[this.stack.length-2];if(t&&t.type==="listItem"&&typeof t.checked=="boolean"){let n=this.stack[this.stack.length-1];n.type;let i=n.children[0];if(i&&i.type==="text"){let a=t.children,o=-1,l;for(;++o<a.length;){let s=a[o];if(s.type==="paragraph"){l=s;break}}l===n&&(i.value=i.value.slice(1),i.value.length===0?n.children.shift():n.position&&i.position&&typeof i.position.start.offset=="number"&&(i.position.start.column++,i.position.start.offset++,n.position.start=Object.assign({},i.position.start)))}}this.exit(e)}r(uu,"exitParagraphWithTaskListItem");function vi(){return[fi(),hi(),pi(),wi(),yi()]}r(vi,"gfmFromMarkdown");var hu={tokenize:xu,partial:!0},Fa={tokenize:bu,partial:!0},Pa={tokenize:ku,partial:!0},$a={tokenize:wu,partial:!0},pu={tokenize:yu,partial:!0},za={name:"wwwAutolink",tokenize:mu,previous:Ra},qa={name:"protocolAutolink",tokenize:gu,previous:Ba},Oe={name:"emailAutolink",tokenize:du,previous:Na},Le={};function Si(){return{text:Le}}r(Si,"gfmAutolinkLiteral");var ht=48;for(;ht<123;)Le[ht]=Oe,ht++,ht===58?ht=65:ht===91&&(ht=97);Le[43]=Oe;Le[45]=Oe;Le[46]=Oe;Le[95]=Oe;Le[72]=[Oe,qa];Le[104]=[Oe,qa];Le[87]=[Oe,za];Le[119]=[Oe,za];function du(e,t,n){let i=this,a,o;return l;function l(f){return!_i(f)||!Na.call(i,i.previous)||Ci(i.events)?n(f):(e.enter("literalAutolink"),e.enter("literalAutolinkEmail"),s(f))}function s(f){return _i(f)?(e.consume(f),s):f===64?(e.consume(f),c):n(f)}function c(f){return f===46?e.check(pu,h,u)(f):f===45||f===95||Z(f)?(o=!0,e.consume(f),c):h(f)}function u(f){return e.consume(f),a=!0,c}function h(f){return o&&a&&ee(i.previous)?(e.exit("literalAutolinkEmail"),e.exit("literalAutolink"),t(f)):n(f)}}r(du,"tokenizeEmailAutolink");function mu(e,t,n){let i=this;return a;function a(l){return l!==87&&l!==119||!Ra.call(i,i.previous)||Ci(i.events)?n(l):(e.enter("literalAutolink"),e.enter("literalAutolinkWww"),e.check(hu,e.attempt(Fa,e.attempt(Pa,o),n),n)(l))}function o(l){return e.exit("literalAutolinkWww"),e.exit("literalAutolink"),t(l)}}r(mu,"tokenizeWwwAutolink");function gu(e,t,n){let i=this,a="",o=!1;return l;function l(f){return(f===72||f===104)&&Ba.call(i,i.previous)&&!Ci(i.events)?(e.enter("literalAutolink"),e.enter("literalAutolinkHttp"),a+=String.fromCodePoint(f),e.consume(f),s):n(f)}function s(f){if(ee(f)&&a.length<5)return a+=String.fromCodePoint(f),e.consume(f),s;if(f===58){let d=a.toLowerCase();if(d==="http"||d==="https")return e.consume(f),c}return n(f)}function c(f){return f===47?(e.consume(f),o?u:(o=!0,c)):n(f)}function u(f){return f===null||at(f)||M(f)||Ee(f)||lt(f)?n(f):e.attempt(Fa,e.attempt(Pa,h),n)(f)}function h(f){return e.exit("literalAutolinkHttp"),e.exit("literalAutolink"),t(f)}}r(gu,"tokenizeProtocolAutolink");function xu(e,t,n){let i=0;return a;function a(l){return(l===87||l===119)&&i<3?(i++,e.consume(l),a):l===46&&i===3?(e.consume(l),o):n(l)}function o(l){return l===null?n(l):t(l)}}r(xu,"tokenizeWwwPrefix");function bu(e,t,n){let i,a,o;return l;function l(u){return u===46||u===95?e.check($a,c,s)(u):u===null||M(u)||Ee(u)||u!==45&&lt(u)?c(u):(o=!0,e.consume(u),l)}function s(u){return u===95?i=!0:(a=i,i=void 0),e.consume(u),l}function c(u){return a||i||!o?n(u):t(u)}}r(bu,"tokenizeDomain");function ku(e,t){let n=0,i=0;return a;function a(l){return l===40?(n++,e.consume(l),a):l===41&&i<n?o(l):l===33||l===34||l===38||l===39||l===41||l===42||l===44||l===46||l===58||l===59||l===60||l===63||l===93||l===95||l===126?e.check($a,t,o)(l):l===null||M(l)||Ee(l)?t(l):(e.consume(l),a)}function o(l){return l===41&&i++,e.consume(l),a}}r(ku,"tokenizePath");function wu(e,t,n){return i;function i(s){return s===33||s===34||s===39||s===41||s===42||s===44||s===46||s===58||s===59||s===63||s===95||s===126?(e.consume(s),i):s===38?(e.consume(s),o):s===93?(e.consume(s),a):s===60||s===null||M(s)||Ee(s)?t(s):n(s)}function a(s){return s===null||s===40||s===91||M(s)||Ee(s)?t(s):i(s)}function o(s){return ee(s)?l(s):n(s)}function l(s){return s===59?(e.consume(s),i):ee(s)?(e.consume(s),l):n(s)}}r(wu,"tokenizeTrail");function yu(e,t,n){return i;function i(o){return e.consume(o),a}function a(o){return Z(o)?n(o):t(o)}}r(yu,"tokenizeEmailDomainDotTrail");function Ra(e){return e===null||e===40||e===42||e===95||e===91||e===93||e===126||M(e)}r(Ra,"previousWww");function Ba(e){return!ee(e)}r(Ba,"previousProtocol");function Na(e){return!(e===47||_i(e))}r(Na,"previousEmail");function _i(e){return e===43||e===45||e===46||e===95||Z(e)}r(_i,"gfmAtext");function Ci(e){let t=e.length,n=!1;for(;t--;){let i=e[t][1];if((i.type==="labelLink"||i.type==="labelImage")&&!i._balanced){n=!0;break}if(i._gfmAutolinkLiteralWalkedInto){n=!1;break}}return e.length>0&&!n&&(e[e.length-1][1]._gfmAutolinkLiteralWalkedInto=!0),n}r(Ci,"previousUnbalanced");var _u={tokenize:Lu,partial:!0};function Ti(){return{document:{91:{name:"gfmFootnoteDefinition",tokenize:Au,continuation:{tokenize:Eu},exit:Iu}},text:{91:{name:"gfmFootnoteCall",tokenize:Tu},93:{name:"gfmPotentialFootnoteCall",add:"after",tokenize:Su,resolveTo:Cu}}}}r(Ti,"gfmFootnote");function Su(e,t,n){let i=this,a=i.events.length,o=i.parser.gfmFootnotes||(i.parser.gfmFootnotes=[]),l;for(;a--;){let c=i.events[a][1];if(c.type==="labelImage"){l=c;break}if(c.type==="gfmFootnoteCall"||c.type==="labelLink"||c.type==="label"||c.type==="image"||c.type==="link")break}return s;function s(c){if(!l||!l._balanced)return n(c);let u=ie(i.sliceSerialize({start:l.end,end:i.now()}));return u.codePointAt(0)!==94||!o.includes(u.slice(1))?n(c):(e.enter("gfmFootnoteCallLabelMarker"),e.consume(c),e.exit("gfmFootnoteCallLabelMarker"),t(c))}}r(Su,"tokenizePotentialGfmFootnoteCall");function Cu(e,t){let n=e.length,i;for(;n--;)if(e[n][1].type==="labelImage"&&e[n][0]==="enter"){i=e[n][1];break}e[n+1][1].type="data",e[n+3][1].type="gfmFootnoteCallLabelMarker";let a={type:"gfmFootnoteCall",start:Object.assign({},e[n+3][1].start),end:Object.assign({},e[e.length-1][1].end)},o={type:"gfmFootnoteCallMarker",start:Object.assign({},e[n+3][1].end),end:Object.assign({},e[n+3][1].end)};o.end.column++,o.end.offset++,o.end._bufferIndex++;let l={type:"gfmFootnoteCallString",start:Object.assign({},o.end),end:Object.assign({},e[e.length-1][1].start)},s={type:"chunkString",contentType:"string",start:Object.assign({},l.start),end:Object.assign({},l.end)},c=[e[n+1],e[n+2],["enter",a,t],e[n+3],e[n+4],["enter",o,t],["exit",o,t],["enter",l,t],["enter",s,t],["exit",s,t],["exit",l,t],e[e.length-2],e[e.length-1],["exit",a,t]];return e.splice(n,e.length-n+1,...c),e}r(Cu,"resolveToPotentialGfmFootnoteCall");function Tu(e,t,n){let i=this,a=i.parser.gfmFootnotes||(i.parser.gfmFootnotes=[]),o=0,l;return s;function s(f){return e.enter("gfmFootnoteCall"),e.enter("gfmFootnoteCallLabelMarker"),e.consume(f),e.exit("gfmFootnoteCallLabelMarker"),c}function c(f){return f!==94?n(f):(e.enter("gfmFootnoteCallMarker"),e.consume(f),e.exit("gfmFootnoteCallMarker"),e.enter("gfmFootnoteCallString"),e.enter("chunkString").contentType="string",u)}function u(f){if(o>999||f===93&&!l||f===null||f===91||M(f))return n(f);if(f===93){e.exit("chunkString");let d=e.exit("gfmFootnoteCallString");return a.includes(ie(i.sliceSerialize(d)))?(e.enter("gfmFootnoteCallLabelMarker"),e.consume(f),e.exit("gfmFootnoteCallLabelMarker"),e.exit("gfmFootnoteCall"),t):n(f)}return M(f)||(l=!0),o++,e.consume(f),f===92?h:u}function h(f){return f===91||f===92||f===93?(e.consume(f),o++,u):u(f)}}r(Tu,"tokenizeGfmFootnoteCall");function Au(e,t,n){let i=this,a=i.parser.gfmFootnotes||(i.parser.gfmFootnotes=[]),o,l=0,s;return c;function c(b){return e.enter("gfmFootnoteDefinition")._container=!0,e.enter("gfmFootnoteDefinitionLabel"),e.enter("gfmFootnoteDefinitionLabelMarker"),e.consume(b),e.exit("gfmFootnoteDefinitionLabelMarker"),u}function u(b){return b===94?(e.enter("gfmFootnoteDefinitionMarker"),e.consume(b),e.exit("gfmFootnoteDefinitionMarker"),e.enter("gfmFootnoteDefinitionLabelString"),e.enter("chunkString").contentType="string",h):n(b)}function h(b){if(l>999||b===93&&!s||b===null||b===91||M(b))return n(b);if(b===93){e.exit("chunkString");let E=e.exit("gfmFootnoteDefinitionLabelString");return o=ie(i.sliceSerialize(E)),e.enter("gfmFootnoteDefinitionLabelMarker"),e.consume(b),e.exit("gfmFootnoteDefinitionLabelMarker"),e.exit("gfmFootnoteDefinitionLabel"),d}return M(b)||(s=!0),l++,e.consume(b),b===92?f:h}function f(b){return b===91||b===92||b===93?(e.consume(b),l++,h):h(b)}function d(b){return b===58?(e.enter("definitionMarker"),e.consume(b),e.exit("definitionMarker"),a.includes(o)||a.push(o),D(e,p,"gfmFootnoteDefinitionWhitespace")):n(b)}function p(b){return t(b)}}r(Au,"tokenizeDefinitionStart");function Eu(e,t,n){return e.check(Ie,t,e.attempt(_u,t,n))}r(Eu,"tokenizeDefinitionContinuation");function Iu(e){e.exit("gfmFootnoteDefinition")}r(Iu,"gfmFootnoteDefinitionEnd");function Lu(e,t,n){let i=this;return D(e,a,"gfmFootnoteDefinitionIndent",5);function a(o){let l=i.events[i.events.length-1];return l&&l[1].type==="gfmFootnoteDefinitionIndent"&&l[2].sliceSerialize(l[1],!0).length===4?t(o):n(o)}}r(Lu,"tokenizeIndent");var Bv={}.hasOwnProperty;function Ai(e){let n=(e||{}).singleTilde,i={name:"strikethrough",tokenize:o,resolveAll:a};return n==null&&(n=!0),{text:{126:i},insideSpan:{null:[i]},attentionMarkers:{null:[126]}};function a(l,s){let c=-1;for(;++c<l.length;)if(l[c][0]==="enter"&&l[c][1].type==="strikethroughSequenceTemporary"&&l[c][1]._close){let u=c;for(;u--;)if(l[u][0]==="exit"&&l[u][1].type==="strikethroughSequenceTemporary"&&l[u][1]._open&&l[c][1].end.offset-l[c][1].start.offset===l[u][1].end.offset-l[u][1].start.offset){l[c][1].type="strikethroughSequence",l[u][1].type="strikethroughSequence";let h={type:"strikethrough",start:Object.assign({},l[u][1].start),end:Object.assign({},l[c][1].end)},f={type:"strikethroughText",start:Object.assign({},l[u][1].end),end:Object.assign({},l[c][1].start)},d=[["enter",h,s],["enter",l[u][1],s],["exit",l[u][1],s],["enter",f,s]],p=s.parser.constructs.insideSpan.null;p&&re(d,d.length,0,Ge(p,l.slice(u+1,c),s)),re(d,d.length,0,[["exit",f,s],["enter",l[c][1],s],["exit",l[c][1],s],["exit",h,s]]),re(l,u-1,c-u+3,d),c=u+d.length-2;break}}for(c=-1;++c<l.length;)l[c][1].type==="strikethroughSequenceTemporary"&&(l[c][1].type="data");return l}r(a,"resolveAllStrikethrough");function o(l,s,c){let u=this.previous,h=this.events,f=0;return d;function d(b){return u===126&&h[h.length-1][1].type!=="characterEscape"?c(b):(l.enter("strikethroughSequenceTemporary"),p(b))}function p(b){let E=Me(u);if(b===126)return f>1?c(b):(l.consume(b),f++,p);if(f<2&&!n)return c(b);let T=l.exit("strikethroughSequenceTemporary"),w=Me(b);return T._open=!w||w===2&&!!E,T._close=!E||E===2&&!!w,s(b)}}r(o,"tokenizeStrikethrough")}r(Ai,"gfmStrikethrough");var jn=class{static{r(this,"EditMap")}constructor(){this.map=[],this.index=new Map}add(t,n,i){Pu(this,t,n,i)}consume(t){if(this.map.sort(function(o,l){return o[0]-l[0]}),this.map.length===0)return;let n=this.map.length,i=[];for(;n>0;)n-=1,i.push(t.slice(this.map[n][0]+this.map[n][1]),this.map[n][2]),t.length=this.map[n][0];i.push(t.slice()),t.length=0;let a=i.pop();for(;a;){for(let o of a)t.push(o);a=i.pop()}this.map.length=0,this.index.clear()}};function Pu(e,t,n,i){if(n===0&&i.length===0)return;let a=e.index.get(t);if(a){a[1]+=n,a[2].push(...i);return}let o=[t,n,i];e.map.push(o),e.index.set(t,o)}r(Pu,"addImplementation");function Ma(e,t){let n=!1,i=[];for(;t<e.length;){let a=e[t];if(n){if(a[0]==="enter")a[1].type==="tableContent"&&i.push(e[t+1][1].type==="tableDelimiterMarker"?"left":"none");else if(a[1].type==="tableContent"){if(e[t-1][1].type==="tableDelimiterMarker"){let o=i.length-1;i[o]=i[o]==="left"?"center":"right"}}else if(a[1].type==="tableDelimiterRow")break}else a[0]==="enter"&&a[1].type==="tableDelimiterRow"&&(n=!0);t+=1}return i}r(Ma,"gfmTableAlign");function Ei(){return{flow:{null:{name:"table",tokenize:$u,resolveAll:zu}}}}r(Ei,"gfmTable");function $u(e,t,n){let i=this,a=0,o=0,l;return s;function s(x){let z=i.events.length-1;for(;z>-1;){let{type:H}=i.events[z][1];if(H==="lineEnding"||H==="linePrefix")z--;else break}let O=z>-1?i.events[z][1].type:null,I=O==="tableHead"||O==="tableRow"?y:c;return I===y&&i.parser.lazy[i.now().line]?n(x):I(x)}function c(x){return e.enter("tableHead"),e.enter("tableRow"),u(x)}function u(x){return x===124||(l=!0,o+=1),h(x)}function h(x){return x===null?n(x):C(x)?o>1?(o=0,i.interrupt=!0,e.exit("tableRow"),e.enter("lineEnding"),e.consume(x),e.exit("lineEnding"),p):n(x):L(x)?D(e,h,"whitespace")(x):(o+=1,l&&(l=!1,a+=1),x===124?(e.enter("tableCellDivider"),e.consume(x),e.exit("tableCellDivider"),l=!0,h):(e.enter("data"),f(x)))}function f(x){return x===null||x===124||M(x)?(e.exit("data"),h(x)):(e.consume(x),x===92?d:f)}function d(x){return x===92||x===124?(e.consume(x),f):f(x)}function p(x){return i.interrupt=!1,i.parser.lazy[i.now().line]?n(x):(e.enter("tableDelimiterRow"),l=!1,L(x)?D(e,b,"linePrefix",i.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(x):b(x))}function b(x){return x===45||x===58?T(x):x===124?(l=!0,e.enter("tableCellDivider"),e.consume(x),e.exit("tableCellDivider"),E):$(x)}function E(x){return L(x)?D(e,T,"whitespace")(x):T(x)}function T(x){return x===58?(o+=1,l=!0,e.enter("tableDelimiterMarker"),e.consume(x),e.exit("tableDelimiterMarker"),w):x===45?(o+=1,w(x)):x===null||C(x)?P(x):$(x)}function w(x){return x===45?(e.enter("tableDelimiterFiller"),S(x)):$(x)}function S(x){return x===45?(e.consume(x),S):x===58?(l=!0,e.exit("tableDelimiterFiller"),e.enter("tableDelimiterMarker"),e.consume(x),e.exit("tableDelimiterMarker"),_):(e.exit("tableDelimiterFiller"),_(x))}function _(x){return L(x)?D(e,P,"whitespace")(x):P(x)}function P(x){return x===124?b(x):x===null||C(x)?!l||a!==o?$(x):(e.exit("tableDelimiterRow"),e.exit("tableHead"),t(x)):$(x)}function $(x){return n(x)}function y(x){return e.enter("tableRow"),F(x)}function F(x){return x===124?(e.enter("tableCellDivider"),e.consume(x),e.exit("tableCellDivider"),F):x===null||C(x)?(e.exit("tableRow"),t(x)):L(x)?D(e,F,"whitespace")(x):(e.enter("data"),N(x))}function N(x){return x===null||x===124||M(x)?(e.exit("data"),F(x)):(e.consume(x),x===92?W:N)}function W(x){return x===92||x===124?(e.consume(x),N):N(x)}}r($u,"tokenizeTable");function zu(e,t){let n=-1,i=!0,a=0,o=[0,0,0,0],l=[0,0,0,0],s=!1,c=0,u,h,f,d=new jn;for(;++n<e.length;){let p=e[n],b=p[1];p[0]==="enter"?b.type==="tableHead"?(s=!1,c!==0&&(Oa(d,t,c,u,h),h=void 0,c=0),u={type:"table",start:Object.assign({},b.start),end:Object.assign({},b.end)},d.add(n,0,[["enter",u,t]])):b.type==="tableRow"||b.type==="tableDelimiterRow"?(i=!0,f=void 0,o=[0,0,0,0],l=[0,n+1,0,0],s&&(s=!1,h={type:"tableBody",start:Object.assign({},b.start),end:Object.assign({},b.end)},d.add(n,0,[["enter",h,t]])),a=b.type==="tableDelimiterRow"?2:h?3:1):a&&(b.type==="data"||b.type==="tableDelimiterMarker"||b.type==="tableDelimiterFiller")?(i=!1,l[2]===0&&(o[1]!==0&&(l[0]=l[1],f=Vn(d,t,o,a,void 0,f),o=[0,0,0,0]),l[2]=n)):b.type==="tableCellDivider"&&(i?i=!1:(o[1]!==0&&(l[0]=l[1],f=Vn(d,t,o,a,void 0,f)),o=l,l=[o[1],n,0,0])):b.type==="tableHead"?(s=!0,c=n):b.type==="tableRow"||b.type==="tableDelimiterRow"?(c=n,o[1]!==0?(l[0]=l[1],f=Vn(d,t,o,a,n,f)):l[1]!==0&&(f=Vn(d,t,l,a,n,f)),a=0):a&&(b.type==="data"||b.type==="tableDelimiterMarker"||b.type==="tableDelimiterFiller")&&(l[3]=n)}for(c!==0&&Oa(d,t,c,u,h),d.consume(t.events),n=-1;++n<t.events.length;){let p=t.events[n];p[0]==="enter"&&p[1].type==="table"&&(p[1]._align=Ma(t.events,n))}return e}r(zu,"resolveTable");function Vn(e,t,n,i,a,o){let l=i===1?"tableHeader":i===2?"tableDelimiter":"tableData",s="tableContent";n[0]!==0&&(o.end=Object.assign({},Dt(t.events,n[0])),e.add(n[0],0,[["exit",o,t]]));let c=Dt(t.events,n[1]);if(o={type:l,start:Object.assign({},c),end:Object.assign({},c)},e.add(n[1],0,[["enter",o,t]]),n[2]!==0){let u=Dt(t.events,n[2]),h=Dt(t.events,n[3]),f={type:s,start:Object.assign({},u),end:Object.assign({},h)};if(e.add(n[2],0,[["enter",f,t]]),i!==2){let d=t.events[n[2]],p=t.events[n[3]];if(d[1].end=Object.assign({},p[1].end),d[1].type="chunkText",d[1].contentType="text",n[3]>n[2]+1){let b=n[2]+1,E=n[3]-n[2]-1;e.add(b,E,[])}}e.add(n[3]+1,0,[["exit",f,t]])}return a!==void 0&&(o.end=Object.assign({},Dt(t.events,a)),e.add(a,0,[["exit",o,t]]),o=void 0),o}r(Vn,"flushCell");function Oa(e,t,n,i,a){let o=[],l=Dt(t.events,n);a&&(a.end=Object.assign({},l),o.push(["exit",a,t])),i.end=Object.assign({},l),o.push(["exit",i,t]),e.add(n+1,0,o)}r(Oa,"flushTableEnd");function Dt(e,t){let n=e[t],i=n[0]==="enter"?"start":"end";return n[1][i]}r(Dt,"getPoint");var Ru=/<(\/?)(iframe|noembed|noframes|plaintext|script|style|title|textarea|xmp)(?=[\t\n\f\r />])/gi,g_=new RegExp("^"+Ru.source,"i");var Nu={name:"tasklistCheck",tokenize:Mu};function Ii(){return{text:{91:Nu}}}r(Ii,"gfmTaskListItem");function Mu(e,t,n){let i=this;return a;function a(c){return i.previous!==null||!i._gfmTasklistFirstContentOfListItem?n(c):(e.enter("taskListCheck"),e.enter("taskListCheckMarker"),e.consume(c),e.exit("taskListCheckMarker"),o)}function o(c){return M(c)?(e.enter("taskListCheckValueUnchecked"),e.consume(c),e.exit("taskListCheckValueUnchecked"),l):c===88||c===120?(e.enter("taskListCheckValueChecked"),e.consume(c),e.exit("taskListCheckValueChecked"),l):n(c)}function l(c){return c===93?(e.enter("taskListCheckMarker"),e.consume(c),e.exit("taskListCheckMarker"),e.exit("taskListCheck"),s):n(c)}function s(c){return C(c)?t(c):L(c)?e.check({tokenize:Ou},t,n)(c):n(c)}}r(Mu,"tokenizeTasklistCheck");function Ou(e,t,n){return D(e,i,"whitespace");function i(a){return a===null?n(a):t(a)}}r(Ou,"spaceThenNonSpace");function Ha(e){return An([Si(),Ti(),Ai(e),Ei(),Ii()])}r(Ha,"gfm");function Gn(e){return oi(e,{extensions:[Ha()],mdastExtensions:[vi()]})}r(Gn,"parseMarkdown");function xe(e){if(!e||typeof e!="object")return{};try{return JSON.parse(JSON.stringify(e))}catch{return{}}}r(xe,"sanitizeProps");function Qn(e){if(!e||typeof e!="object")return 1;if(Array.isArray(e)){let n=1;for(let i of e)n+=Qn(i);return n}let t=1;if("c"in e&&Array.isArray(e.c))for(let n of e.c)t+=Qn(n);return t}r(Qn,"countWireNodes");function Kn(e){if(!e||typeof e!="object")return 0;if(Array.isArray(e)){let n=0;for(let i of e)n+=Kn(i);return n}let t=e.t==="i"?1:0;if("c"in e&&Array.isArray(e.c))for(let n of e.c)t+=Kn(n);return t}r(Kn,"countWireIslands");function Li(e){if(!e||typeof e!="object")return"";let t=e;return typeof t.value=="string"?t.value:Array.isArray(t.children)?t.children.map(Li).join(""):""}r(Li,"extractText");function Jn(e){let t="";function n(o){if(!o||typeof o!="object")return null;switch(o.type){case"root":{let l=[];for(let s of o.children){let c=n(s);c!==null&&l.push(c)}return{t:"f",c:l}}case"heading":{let l=Li(o);o.depth===1&&!t&&(t=l.trim());let s=yn(l),c=i(o.children);return{t:"c",n:"Heading",p:xe({depth:o.depth,id:s}),c}}case"paragraph":{let s=Li(o).trim().match(/^:{2,3}\s*([A-Za-z0-9_.-]+)\s*(?:\{([\s\S]*)\})?\s*(?::{2,3})?$/);if(s&&s[1]){let u=s[1],h=u.endsWith(".js")?u:`${u}.js`,f={};if(s[2]){let d=s[2].trim(),p=d.startsWith("{")?d:`{${d}}`;try{f=JSON.parse(p)}catch{try{let b=p.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g,'$1"$2":').replace(/'([^']*)'/g,'"$1"');f=JSON.parse(b)}catch{}}}return{t:"i",n:h,p:xe(f),c:[]}}let c=i(o.children);return{t:"c",n:"Paragraph",p:{},c}}case"blockquote":return{t:"c",n:"Blockquote",p:{},c:i(o.children)};case"list":return{t:"c",n:"List",p:xe({ordered:!!o.ordered,start:o.start??1}),c:i(o.children)};case"listItem":return{t:"c",n:"ListItem",p:xe({checked:typeof o.checked=="boolean"?o.checked:void 0}),c:i(o.children)};case"code":{let l=o.lang?.trim()??"";if(l.startsWith("island:")){let s=l.slice(7).trim(),c=s.endsWith(".js")?s:`${s}.js`,u={};if(o.value.trim())try{u=JSON.parse(o.value.trim())}catch{u={raw:o.value}}return{t:"i",n:c,p:xe(u),c:[]}}return{t:"c",n:"CodeBlock",p:xe({lang:o.lang??"",meta:o.meta??"",value:o.value??""})}}case"inlineCode":return{t:"c",n:"InlineCode",p:xe({value:o.value??""})};case"link":return{t:"c",n:"Link",p:xe({href:o.url,title:o.title??void 0}),c:i(o.children)};case"image":return{t:"c",n:"Image",p:xe({src:o.url,alt:o.alt??"",title:o.title??void 0})};case"strong":return{t:"e",n:"strong",c:i(o.children)};case"emphasis":return{t:"e",n:"em",c:i(o.children)};case"delete":return{t:"e",n:"del",c:i(o.children)};case"break":return{t:"e",n:"br"};case"thematicBreak":return{t:"e",n:"hr"};case"table":{let l=o.align??[],s=o.children.map((f,d)=>({t:"c",n:"TableRow",c:f.children.map((p,b)=>({t:"c",n:"TableCell",p:xe({header:d===0,align:l[b]??void 0}),c:i(p.children)}))})),[c,...u]=s,h=[];return c&&h.push({t:"e",n:"thead",c:[c]}),u.length>0&&h.push({t:"e",n:"tbody",c:u}),{t:"c",n:"Table",c:h}}case"tableRow":return{t:"c",n:"TableRow",c:i(o.children)};case"tableCell":return{t:"c",n:"TableCell",c:i(o.children)};case"text":return o.value;case"html":return null;default:return null}}r(n,"transform");function i(o){if(!Array.isArray(o))return[];let l=[];for(let s of o){let c=n(s);c!==null&&l.push(c)}return l}return r(i,"transformChildren"),{wire:n(e)??{t:"f",c:[]},title:t||"Documentation"}}r(Jn,"mdastToWire");function Di(e,t){let{frontmatter:n,body:i}=Ut(e),a=Gn(i),{wire:o,title:l}=Jn(a),s=typeof n.title=="string"&&n.title.trim()?n.title.trim():l;return{wire:o,title:s,raw:e,url:t,renderedAt:Date.now(),frontmatter:n}}r(Di,"processMarkdown");async function Ft(e,t,n={}){let i=(n.cacheTTLSeconds??60)*1e3,a=`wire:${e}`;try{let s=await t.cacheGet(a);if(s){let c=JSON.parse(s);if(Date.now()-c.renderedAt<i)return c}}catch(s){console.warn(`[pipeline] Cache lookup warning for ${e}:`,s)}let o=await t.readText(e),l=Di(o,e);try{await t.cachePut(a,JSON.stringify(l))}catch(s){console.warn(`[pipeline] Cache write warning for ${e}:`,s)}return l}r(Ft,"loadDoc");function Uu(e,t={}){let n=t.basePath??"./articles";return r(async function(a){let{docPath:o}=tt(a,n);return await Ft(o,e,t)},"localFetch")}r(Uu,"createLocalFetcher");async function Ua(e,t,n={}){let{docPath:i}=tt(e,n.basePath??"./articles");if(bn())try{let o=await fetch(i,{headers:{Accept:"application/json"}});if(o.ok&&(o.headers.get("content-type")??"").includes("application/json"))return await o.json()}catch(o){console.warn("[client-adapter] SW fetch failed, falling back to local:",o)}return await Uu(t,n)(i)}r(Ua,"mdFetch");function Yn(e={}){let t=e.cacheName??"md-wire-v1",n=e.useIndexedDB!==!1&&typeof indexedDB<"u";return{async readText(i){let a=i.replace(/[?#].*$/,""),o=a.startsWith("/")?`.${a}`:a,l=null;try{l=await fetch(`${o}?_md_raw=1`)}catch{if(o!==a)try{l=await fetch(`${a}?_md_raw=1`)}catch{}}if(l&&l.ok){let s=await l.text();return n&&_t(`raw:${a}`,s).catch(()=>{}),s}if(n)try{let s=await vt(`raw:${a}`);if(s)return s}catch{}throw new Error(`Failed to load markdown: document not found (${i})`)},async cacheGet(i){if(n)try{let a=await vt(i);if(a)return a}catch{}if(typeof caches<"u")try{let a=await caches.open(t),o=new Request(`https://md-wire.local/${encodeURIComponent(i)}`),l=await a.match(o);if(l)return await l.text()}catch{}return null},async cachePut(i,a){if(n)try{await _t(i,a)}catch{}if(typeof caches<"u")try{let o=await caches.open(t),l=new Request(`https://md-wire.local/${encodeURIComponent(i)}`),s=new Response(a,{headers:{"Content-Type":"application/json"}});await o.put(l,s)}catch{}},async cacheDelete(i){if(n)try{await Lo(i)}catch{}if(typeof caches<"u")try{let a=await caches.open(t),o=new Request(`https://md-wire.local/${encodeURIComponent(i)}`);await a.delete(o)}catch{}}}}r(Yn,"createBrowserIO");function Wa(e={}){let t=new Map(Object.entries(e)),n=new Map;return{async readText(i){let a=i.replace(/[?#].*$/,""),o=t.get(a)??t.get(i);if(o!==void 0)return o;throw new Error(`File not found: ${i}`)},async cacheGet(i){return n.get(i)??null},async cachePut(i,a){n.set(i,a)},async cacheDelete(i){n.delete(i)}}}r(Wa,"createMemoryIO");var we={},Zn={},Fi=new WeakSet,tn=null,Xn=new Set;typeof globalThis<"u"&&(globalThis.__mdblog_islands=we);function ja(e,t,n){Ue(null,n),n.innerHTML="",Ue(Y(e,t),n)}r(ja,"mountIsland");function Va(e){try{return JSON.parse(e.dataset.props||"{}")}catch{return{}}}r(Va,"readIslandProps");function Ga(e){e.dataset.islandHydrated="true",e.dataset.islandMountedProps=e.dataset.props??"{}",delete e.dataset.islandMissing}r(Ga,"markMounted");async function Wu(e){let t=e.dataset.island;if(!t)return!1;let n=t.endsWith(".js")?t:`${t}.js`,i=n.replace(/\.js$/,""),a=we[t]||we[n]||we[i];if(a)try{return ja(a,Va(e),e),Ga(e),!0}catch(o){return console.error(`[hydrate] Failed to hydrate cached island "${t}":`,o),e.dataset.islandError="true",!1}try{if(!Zn[n]){let c=globalThis.location?new URL(`./islands/${n}`,globalThis.location.href).href:`./islands/${n}`,u=new Function("path","return import(path)"),h=u(c).catch(()=>u(`./islands/${n}`));h.catch(()=>{delete Zn[n]}),Zn[n]=h}let o=await Zn[n],l=o?Object.keys(o)[0]:void 0,s=o?o[i]||o.default||(l?o[l]:null):null;return s?(we[t]=s,we[n]=s,we[i]=s,ja(s,Va(e),e),Ga(e),!0):(e.dataset.islandMissing="true",!1)}catch(o){return console.warn(`[hydrate] Failed to load island ./islands/${n}:`,o),e.dataset.islandError="true",!1}}r(Wu,"hydrateNode");async function Qa(e){let t=e.querySelectorAll("[data-island]"),n=0;for(let i of t){if(i.dataset.islandPrerendered==="true")continue;let a=i.dataset.props??"{}",o=i.dataset.islandMountedProps;if(o!==void 0&&o===a||Fi.has(i))continue;Fi.add(i);let l=await Wu(i);Fi.delete(i),l&&n++}return n}r(Qa,"scanIslands");async function pt(e={}){if(typeof document>"u")return 0;let t=e.root??document.body;if(tn)return Xn.add(t),tn;let n=(async()=>{let i=await Qa(t);for(;Xn.size>0;){let a=[...Xn];Xn.clear();for(let o of a)i+=await Qa(o)}return i})();tn=n;try{return await n}finally{tn===n&&(tn=null)}}r(pt,"hydrateIslands");var ve="v0.2.3#mvmwaqyg";var ju=`mdblog-pwa-${ve||"dev"}`,Vu=Yn({cacheName:ju,useIndexedDB:!0}),Gu={basePath:"./articles",cacheTTLSeconds:60},er=0,tr=null,Qu=15e3;function Ku(e,t,n){return new Promise((i,a)=>{let o=setTimeout(()=>{a(new Error(`${n} did not answer within ${Math.round(t/1e3)}s. The copy held by the browser may be damaged: reload the page, and if it keeps happening clear the site data.`))},t);e.then(i,a).then(()=>clearTimeout(o))})}r(Ku,"withTimeout");async function dt(e){let t=ce(e);t.endsWith(".md")||(t=`${t}.md`);let n=t==="index.md"?"#/":`#/${t}`,i=`./articles/${t}`;typeof globalThis<"u"&&globalThis.location&&globalThis.location.hash!==n&&(tr=n,globalThis.location.hash=n);let a=++er;Ae.value=n,Mr.value="preview",Ct.value=!0,Tt.value=null;try{let o=performance.now(),l=await Ku(Ua(i,Vu,Gu),Qu,i);if(a!==er)return;let s=performance.now();Nr.value=Math.max(.1,Number((s-o).toFixed(1))),St.value=l,document.title=`${l.title} - mdBlog`,setTimeout(()=>{pt()},50)}catch(o){if(a!==er)return;console.error(`[router] Error loading ${i}:`,o),Tt.value=o instanceof Error?o.message:String(o)}finally{a===er&&(Ct.value=!1)}}r(dt,"navigateTo");function Pi(){if(typeof window>"u")return;Cn().then(()=>{!globalThis.location.hash&&ae.value.length>0&&ae.value[0]&&dt(ae.value[0].path)}).catch(()=>{});function e(){let n=globalThis.location.hash;if(tr!==null){let i=tr;if(tr=null,n===i)return}dt(n||"index.md")}r(e,"handleRoute"),globalThis.addEventListener("hashchange",e);let t=document.getElementById("__md_wire");if(t&&t.textContent)try{let n=JSON.parse(t.textContent);St.value=n,Ae.value=n.url||"#/",document.title=`${n.title} - mdBlog`,t.remove(),setTimeout(()=>{pt()},50);return}catch(n){console.warn("[router] Failed to parse inline __md_wire script:",n)}e()}r(Pi,"initRouter");function nr({placeholder:e="Search articles...",class:t=""}={}){let n=Sn,i=ke(null);We(()=>{Te.value&&i.value?.focus()},[Te.value]);let a=n.value.trim().toLowerCase(),o=nt.value.length,l=a===""?[]:nt.value.filter(u=>{let h=u.title.toLowerCase().includes(a),f=u.description&&u.description.toLowerCase().includes(a),d=u.content&&u.content.toLowerCase().includes(a),p=Array.isArray(u.tags)&&u.tags.some(b=>b.toLowerCase().includes(a));return h||f||d||p}).slice(0,10);function s(u){jt(),dt(u)}r(s,"handleSelect");function c(){jt()}return r(c,"handleClose"),A`
    <div class=${`row no-margin ${t}`.trim()}>
      <!-- The two triggers are mutually exclusive in the DOM rather than through
          breakpoint classes: BeerCSS's s/m/l classes stop hiding either one at
          fractional widths (browser zoom between 600 and 601, or between 992 and
          993), which would show both and blow up the bar. Narrow screens only
          have room for the icon button anyway. -->
      ${j.value?A`
          <div
            class="field prefix round fill small surface-container-highest no-margin"
            onClick=${rt}
            title="Search (Ctrl+K)"
          >
            <i class="front">search</i>
            <input
              type="search"
              placeholder=${e}
              value=${n.value}
              aria-label="Search articles"
              aria-keyshortcuts="Control+K Meta+K"
              onFocus=${rt}
              onInput=${u=>{n.value=u.target.value,rt()}}
            />
          </div>
        `:A`
          <button
            class="circle transparent"
            onClick=${rt}
            aria-label="Search articles"
            title="Search (Ctrl+K)"
          >
            <i>search</i>
          </button>
        `}

      <!-- Result panel: BeerCSS's native dialog (z-index 100). On wide screens
          it is a centered fixed-width card; on narrow ones it fills the whole
          screen, which is the most readable way to present a result list on a
          phone. The dialog already brings overflow-y:auto and max-block-size, so
          it needs no scroll class of its own. -->
      ${Te.value?A`
          <div class="overlay active" onClick=${c}></div>

          <dialog
            class=${j.value?"active large-width":"active max"}
            aria-label="Search articles"
          >
            <!-- Title on the left, actions pushed to the right edge. A <header>
                does not work here: BeerCSS gives it flex-direction:column and
                justify-content:center, which would stack the "Esc" chip and the
                close button in the middle of the panel. The .max spacer (flex:1)
                is the only right-alignment mechanism available — the framework
                has no justify-between. -->
            <div class="row no-margin">
              <i class="primary-text">search</i>
              <h6
                class=${`bold no-margin ${j.value?"":"small"}`}
              >Search articles</h6>
              <div class="max"></div>
              ${j.value?A`
                  <span class="chip" title="Close with the Esc key">Esc</span>
                `:null}
              <button
                class="circle transparent"
                onClick=${c}
                aria-label="Close search"
                title="Close (Esc)"
              >
                <i>close</i>
              </button>
            </div>

            <!-- The .field uses neither fill nor border: it keeps BeerCSS's
                elevate1, which is the right contrast against the dialog
                background. The icons carry .front because the absolute children
                of a field are painted in document order and the input, being
                relative, would end up on top of the last one, making "clear"
                unclickable. -->
            <div
              class=${n.value?"field prefix suffix round no-margin":"field prefix round no-margin"}
            >
              <i class="front">search</i>
              <input
                type="search"
                placeholder=${e}
                value=${n.value}
                aria-label="Search articles"
                aria-keyshortcuts="Control+K Meta+K"
                ref=${u=>{i.value=u}}
                onInput=${u=>{n.value=u.target.value}}
              />
              ${n.value?A`
                  <i
                    class="front link"
                    title="Clear search"
                    onClick=${()=>{n.value="",i.value?.focus()}}
                  >
                    close
                  </i>
                `:null}
            </div>

            ${a===""?A`
                <div class="row small-padding round surface-container-low">
                  <i class="primary-text">tips_and_updates</i>
                  <div class="max small-text">
                    Search by title, tag or any word of an article.
                  </div>
                  <span class="small-text secondary-text">
                    ${o} articles
                  </span>
                </div>
              `:null}

            ${l.length>0?A`
                <div class="row small-text secondary-text">
                  <div class="max">
                    ${l.length} result${l.length>1?"s":""} for
                    "${n.value}"
                  </div>
                </div>
              `:null}

            <!-- BeerCSS zeroes the margins of every "a.row" (its own rule), so
                the gap between cards cannot come from the flow: small-margin +
                vertical-margin write var(---margin) with !important and separate
                the rows without taking their full width. The text column also
                needs .truncate: a flexbox item whose overflow is not "visible"
                gets a zero minimum size, and without it the text of a single
                line (white-space:nowrap) would push .max to the full width of
                the sentence — cutting the title in half and throwing the arrow
                outside the panel. -->
            <div class="vertical-margin small-margin" aria-live="polite">
              ${l.map(u=>A`
                  <a
                    key=${u.path}
                    href=${Ce(u.path)}
                    class="row wave round small-padding vertical-margin small-margin surface-container-low"
                    onClick=${h=>{h.preventDefault(),s(u.path)}}
                  >
                    <i class="primary-text">${u.icon||"article"}</i>
                    <div class="max truncate">
                      <div class="bold truncate">${u.title}</div>
                      ${u.description?A`
                          <div class="small-text secondary-text truncate">
                            ${u.description}
                          </div>
                        `:null}
                    </div>
                    <i class="tiny secondary-text">arrow_forward</i>
                  </a>
                `)}
            </div>

            ${a!==""&&l.length===0?A`
                <div
                  class="center-align small-padding round surface-container-low vertical-margin">
                  <i class="primary-text large">search_off</i>
                  <p class="no-margin">
                    No article found for "${n.value}"
                  </p>
                  <p class="small-text secondary-text no-margin">
                    Check the spelling or try a more general word.
                  </p>
                </div>
              `:null}
          </dialog>
        `:null}
    </div>
  `}r(nr,"SearchBox");function rr(){return A`
    <!-- BeerCSS gives nav.top a justify-content:space-around below 600px and
        freezes the bar at 5rem, while every direct child is flex:none and
        therefore cannot shrink: with the default 1rem gap of a nav the brand,
        the status chip and the two icon buttons overflowed a 375px screen and
        the theme toggle fell off the right edge. The no-space class drops the
        gaps between the bar's own children (the .max spacer still pushes the
        actions to the end) and the wordmark steps down to h6.small. -->
    <nav class="top surface-container no-space elevate">
      <button
        class="circle transparent"
        onClick=${()=>ue.value=!ue.value}
        aria-label="Toggle side menu"
        aria-expanded=${ue.value}
        title=${ue.value?"Hide the article list":"Show the article list"}
      >
        <i>${ue.value?"keyboard_arrow_left":"menu"}</i>
      </button>

      <!-- BeerCSS treats every direct "a" child of nav.top as a navigation item
          (flex-direction: column, a fixed 3.5rem width and an icon that gets a
          pill radius plus secondary-container background on hover) — which
          stacks the icon over the name and makes it look like a badge. Wrapping
          the brand in a neutral container keeps the link out of that selector.
          The gap between the icon and the wordmark cannot come from a
          gap-small class (BeerCSS has none: the row keeps its default 1rem),
          so the icon carries an explicit right margin. The link keeps its
          vertical padding but not the 0.75rem of padding on each side: that is
          the one place the bar can lose 16px without anything reading tighter,
          and the space it frees is what keeps the theme toggle on screen when
          the phone is narrow or the user has the system text size turned up. -->
      <div class="row no-margin no-space">
        <a
          href="#/"
          class="row wave transparent no-margin horizontal-padding tiny-padding"
          title="Home page"
        >
          <i class="primary-text bold right-margin small-margin">menu_book</i>
          <h6 class="bold no-margin small">mdBlog</h6>
        </a>
      </div>

      <div class="max"></div>

      <div class="row no-space">
        <!-- The status chip, the search and the theme toggle are one group at the
            end of the bar, not three stations spread over it. The 1rem gap of a
            row cost 32px of the bar and, on the narrowest phones, pushed the
            theme toggle past the right edge — a nav does not wrap and clips what
            falls off. The no-space class drops the gap and the two items after
            the chip take the 0.5rem inline margin BeerCSS itself gives a button:
            enough separation to read as distinct targets, half of what it was. -->
        <!-- Connectivity status chip. The word and the roomy padding come with
            the wide layout and the icon alone with the narrow one: the two
            states branch in the DOM on the same signal, the way the search
            trigger already does, instead of through BeerCSS's s/m/l classes.
            A chip holding only an icon is mostly padding, and on the phone that
            padding is the difference between the bar fitting and the theme
            toggle falling off the edge, so the icon-only state keeps 0.25rem of
            it and the labelled state keeps the framework's own. -->
        <span
          class=${`chip small no-margin ${j.value?"":"horizontal-padding tiny-padding"} ${qe.value?"error-container":"surface-container-highest"}`}
          title=${qe.value?"Offline (no connection)":Re.value?"Online (Service Worker active)":"Online"}
        >
          <i class=${qe.value?"error-text":"green-text"}>
            ${qe.value?"cloud_off":"cloud_done"}
          </i>
          ${j.value?A`<span>${qe.value?"Offline":"Online"}</span>`:null}
        </span>

        <!-- Responsive search: field on m/l, compact button on s -->
        <${nr}
          placeholder="Search articles..."
          class="left-margin small-margin"
        />

        <${Tn} class="left-margin small-margin" />
      </div>
    </nav>
  `}r(rr,"Navbar");function ir(){let e=Ae.value,t=ae.value;if(!ue.value)return null;let n=!j.value,i=A`
    <header class="no-padding no-margin"></header>

    <!-- Panel head: label on the left, close control on the right. There is no
        justify-between in BeerCSS — the .max spacer (flex:1) is the mechanism —
        and no directional border, so the separator below is a divider. -->
    <div class="row no-padding no-space">
      <i class="primary-text tiny right-margin tiny-margin">menu_book</i>
      <span class="bold small-text truncate">Articles</span>
      <div class="max"></div>
      <button
        class="circle transparent"
        onClick=${()=>ue.value=!1}
        aria-label="Close the side navigation"
        title="Close the side menu"
      >
        <i class="small">close</i>
      </button>
    </div>

    <div class="medium-divider"></div>

    <div class="no-margin">
      ${t.map(a=>{let o=ce(e)===ce(a.path),l=a.depth||0,s=l>=2?"left-padding":l===1?"left-padding small-padding":"";return A`
          <a
            key=${a.path}
            href=${Ce(a.path)}
            class=${`row no-space wave round tiny-padding no-margin ${o?"primary-container bold":"transparent"}`}
            onClick=${()=>{j.value||(ue.value=!1)}}
            title=${a.title}
          >
            <i
              class=${`tiny right-margin tiny-margin ${o?"primary-text":"secondary-text"}`}
            >
              ${a.icon||"article"}
            </i>
            <span class=${`max truncate small-text ${s}`}>
              ${a.title}
            </span>
            ${a.badge?A`
                <span
                  class="chip small primary-container left-margin tiny-margin"
                >
                  ${a.badge}
                </span>
              `:null}
          </a>
        `})}
    </div>
  `;return n?A`
      <div
        class="overlay active"
        onClick=${()=>ue.value=!1}
        onTouchMove=${a=>a.preventDefault()}
      ></div>

      <dialog
        class="left small drawer active scroll surface-container-low small-padding"
        aria-label="Article navigation"
      >
        ${i}
      </dialog>
    `:A`
    <nav
      class="left drawer scroll surface-container-low elevate small-padding"
      aria-label="Article navigation"
    >
      ${i}
    </nav>
  `}r(ir,"Sidebar");function Ju({depth:e=1,id:t,children:n}={}){let i=["h4","h5","h6","h6","h6","h6"],a=Math.min(Math.max(Number(e)||1,1),6),o=i[a-1]??"h6",l=a>=4||!j.value,s=t?A`
      <a
        href="#${t}"
        class="secondary-text link small-text medium-opacity left-margin small-margin"
        title="Direct link to this section"
        aria-label="Direct link"
        onClick=${c=>{c.preventDefault(),typeof document<"u"&&document.getElementById(t)?.scrollIntoView({behavior:"smooth",block:"start"})}}
      >
        <i>link</i>
      </a>
    `:null;return Y(o,{id:t,class:`wrap bold top-margin bottom-margin large-margin ${l?"small":""}`.trim()},n,s)}r(Ju,"Heading");function Yu({children:e}={}){return A`<p class="bottom-margin large-margin wrap">${e}</p>`}r(Yu,"Paragraph");function Zu({lang:e,value:t=""}={}){let n=ke(!1);async function i(){try{typeof navigator<"u"&&navigator.clipboard&&(await navigator.clipboard.writeText(t),n.value=!0,setTimeout(()=>{n.value=!1},2e3))}catch{}}return r(i,"handleCopy"),A`
    <article class="no-padding surface-container-highest border round margin">
      <!-- The card's head: language chip on the left, copy button on the right.
          BeerCSS has no justify-between, so a .max spacer does the pushing. The
          strip is padded with the two directional classes rather than a size
          class: a size class would pad it on all four sides and open a gap
          between the strip and the rounded edge of the card it sits in. -->
      <div
        class="row left-padding right-padding small-padding surface-container">
        <span class="chip small primary-container bold">
          ${e||"text"}
        </span>
        <div class="max"></div>
        <button
          class="circle small transparent"
          onClick=${i}
          title="Copy code"
          aria-label="Copy code"
        >
          <i>${n.value?"check":"content_copy"}</i>
        </button>
      </div>
      <!-- The <pre> keeps its own 1rem of padding: it is what holds the code off
          the card's border, so the wrapper adds none of its own. -->
      <div class="scroll">
        <pre class="no-margin"><code class="small-text">${t}</code></pre>
      </div>
    </article>
  `}r(Zu,"CodeBlock");function Xu({value:e=""}={}){return A`<code class="surface-container-high round">${e}</code>`}r(Xu,"InlineCode");function ef({children:e}={}){return A`
    <blockquote class="border round margin wrap">
      ${e}
    </blockquote>
  `}r(ef,"Blockquote");function tf({ordered:e,start:t,children:n}={}){return e?A`
      <ol
        start=${t}
        class="left-padding bottom-margin large-margin wrap"
      >${n}</ol>
    `:A`
    <ul class="left-padding bottom-margin large-margin wrap">${n}</ul>
  `}r(tf,"List");function nf({checked:e,children:t}={}){return typeof e=="boolean"?A`
      <li class="row wrap bottom-margin">
        <label class="checkbox">
          <input type="checkbox" checked=${e} disabled />
          <span></span>
        </label>
        <div class="max wrap">${t}</div>
      </li>
    `:A`<li class="bottom-margin wrap">${t}</li>`}r(nf,"ListItem");function rf({children:e}={}){return A`
    <div class="responsive scroll vertical-margin large-margin">
      <table class="border stripes">${e}</table>
    </div>
  `}r(rf,"Table");function of({children:e}={}){return A`<tr>${e}</tr>`}r(of,"TableRow");var af={left:"left-align",center:"center-align",right:"right-align"};function lf({align:e,header:t,children:n}={}){let i=[t?"primary-container":"",e?af[e]??"":""].filter(Boolean).join(" ");return t?A`<th class=${i} scope="col">${n}</th>`:A`<td class=${i||void 0}>${n}</td>`}r(lf,"TableCell");function sf({href:e="",title:t,children:n}={}){let i=e,a=e.startsWith("http://")||e.startsWith("https://")||e.startsWith("//");if(!a&&(e.endsWith(".md")||e.includes(".md#"))){let o=e.startsWith("./")?e.slice(2):e;i=`#${o.startsWith("/")?o:`/docs/${o}`}`}return A`
    <a
      href=${i}
      title=${t}
      class="link primary-text bold wrap"
      target=${a?"_blank":void 0}
      rel=${a?"noopener noreferrer":void 0}
    >
      ${n}
    </a>
  `}r(sf,"Link");function cf({src:e,alt:t,title:n}={}){return A`
    <!-- no-margin is not decoration: it cancels the user-agent figure margin
        (one em vertically, 40px inline), which would otherwise inset the image
        far more than the prose. The space around the figure then comes from the
        paragraphs before and after it, exactly as it does for every other block. -->
    <figure class="no-margin">
      <img src=${e} alt=${t||""} title=${n} class="responsive round border" loading="lazy" />
      ${t?A`
          <figcaption
            class="small-text secondary-text center-align top-margin tiny-margin">
            ${t}
          </figcaption>
        `:null}
    </figure>
  `}r(cf,"Image");function uf({nodeType:e}={}){return A`
    <span class="chip error-container small" title=${`Unknown node type: ${e}`}>
      [${e??"Unknown"}]
    </span>
  `}r(uf,"Unknown");var $i={Heading:Ju,Paragraph:Yu,CodeBlock:Zu,InlineCode:Xu,Blockquote:ef,List:tf,ListItem:nf,Table:rf,TableRow:of,TableCell:lf,Link:sf,Image:cf,Unknown:uf};function Je(e,t={}){let n={...$i,...t.registry},i=t.islands??{};if(e==null)return null;if(typeof e=="string"||typeof e=="number"||typeof e=="boolean")return e;if(Array.isArray(e))return e.map((o,l)=>Y(ge,{key:l},Je(o,t)));let a=e;switch(a.t){case"f":{let o=(a.c??[]).map((l,s)=>Y(ge,{key:s},Je(l,t)));return Y(ge,null,o)}case"e":{let o=(a.c??[]).map((l,s)=>Y(ge,{key:s},Je(l,t)));return Y(a.n,a.p??{},o)}case"c":{let o=n[a.n]??n.Unknown,l=(a.c??[]).map((c,u)=>Y(ge,{key:u},Je(c,t))),s={...a.p??{},nodeType:a.n};return Y(o,s,l)}case"i":{let o=a.n.endsWith(".js")?a.n:`${a.n}.js`,l=o.replace(/\.js$/,""),s=i[a.n]||i[o]||i[l]||we[a.n]||we[o]||we[l],c=JSON.stringify(a.p??{}),u=t.islands!==void 0,h=u&&!!s,f=u&&!s,d=null;if(h)try{d=Y(s,a.p??{})}catch(p){console.warn(`[from-wire] Initial render error for island ${a.n}:`,p)}return!d&&a.c&&a.c.length>0&&(d=(a.c??[]).map((p,b)=>Y(ge,{key:b},Je(p,t)))),Y("div",{"data-island":a.n,"data-props":c,"data-island-prerendered":h?"true":void 0,"data-island-missing":f?"true":void 0,children:d})}default:return null}}r(Je,"wireToVNode");function nn({headings:e=[],onNavigate:t}={}){if(!e.length)return null;function n(i){return a=>{a.preventDefault(),typeof document<"u"&&document.getElementById(i)?.scrollIntoView({behavior:"smooth",block:"start"}),t?.()}}return r(n,"scrollTo"),A`
    <!-- A plain .vertical box, not a nav: BeerCSS gives every nav
        display:flex with align-items:center, so entries inside nav.vertical
        shrink-wrap to their text and float in the middle of the column instead
        of filling it. The accessible name already comes from the aside or the
        dialog this list lives in. -->
    <div class="vertical">
      ${e.map(i=>A`
          <a
            key=${i.id}
            href="#${i.id}"
            onClick=${n(i.id)}
            class="row no-space wave round tiny-padding small-text secondary-text no-margin"
            title=${i.text}
          >
            <!-- The indent is padding on the label, not a margin on the entry:
                .vertical zeroes the inline margins of its children, so a
                left-margin class would silently do nothing here. -->
            <span
              class=${`max truncate ${i.depth>=3?"left-padding small-padding":""}`}
            >
              ${i.text}
            </span>
          </a>
        `)}
    </div>
  `}r(nn,"Toc");function or(){let e=St.value,t=Ae.value,n=Ct.value,i=Tt.value,a=ve?` ${ve}`:"",o=ke(null),l=ke(!1),s=Do(_n.value);if(We(()=>{let x=o.value;l.value=!!x&&x.offsetHeight>s.maxHeightPx}),We(()=>{e&&(pt(),typeof globalThis<"u"&&globalThis.scrollTo&&globalThis.scrollTo({top:0}))},[e,t]),n&&!e)return A`
      <main class="responsive max padding center-align top-margin">
        <i class="large primary-text">menu_book</i>
        <progress class="circle large"></progress>
        <p class="top-margin secondary-text">
          Loading...
        </p>
      </main>
    `;if(i&&!e)return A`
      <main class="responsive max padding">
        <article class="border error-container round padding margin">
          <div class="row">
            <i class="error-text large">error</i>
            <div>
              <h5
                class=${`no-margin bold ${j.value?"":"small"}`}
              >Could not load the article</h5>
              <p class="top-margin">${i}</p>
            </div>
          </div>
          <div class="top-margin">
            <a class="button primary" href="#/">
              <i>home</i> Go to start
            </a>
          </div>
        </article>
      </main>
    `;if(!e)return A`
      <main class="responsive max padding center-align">
        <p class="secondary-text">No article selected.</p>
      </main>
    `;let c=new Map;for(let x of ae.value)c.set(ce(x.path),x);let u=c.get(ce(t)),h=[],f=u;for(;f&&(h.unshift(f),!(!f.parentPath||ce(f.parentPath)===ce(f.path)));)f=c.get(ce(f.parentPath));let d=ae.value.find(x=>x.depth===0||x.name==="index.md"||x.path.endsWith("/index.md"));d&&h.length>0&&h[0]&&h[0].path!==d.path&&h.unshift(d);let p=e.frontmatter?.title||u?.title||e.title||"Article",b=e.frontmatter?.author||u?.author,E=e.frontmatter?.date||u?.date,T=Array.isArray(u?.tags)?u.tags:Array.isArray(e.frontmatter?.tags)?e.frontmatter.tags:[],w=Pr(e.raw||""),S=e.wire;if(S&&S.t==="f"&&Array.isArray(S.c)&&S.c.length>0){let x=S.c[0];x&&x.t==="c"&&x.n==="Heading"&&(x.p?.depth===1||x.p?.depth==="1")&&(S={...S,c:S.c.slice(1)})}let _=Fr(S),P=_.length>=2,{prev:$,next:y}=$r(ae.value,t),F=P&&j.value&&Be.value,N=P&&!j.value;function W(){j.value?Be.value=!Be.value:Br()}return r(W,"toggleToc"),A`
    <main class="responsive max padding">
      <!-- 1. Discreet compact breadcrumb that wraps -->
      ${h.length>1?A`
          <nav
            class="row wrap no-space small-text secondary-text bottom-margin">
            ${h.map((x,z)=>{let O=z===h.length-1,I=z===0&&(x.name==="index.md"||x.path.endsWith("/index.md"))?"Start":x.title;return A`
                ${z>0?A`<i class="tiny tiny-margin medium-opacity">chevron_right</i>`:null}
                <a
                  href=${Ce(x.path)}
                  class=${`wrap ${O?"bold primary-text":"secondary-text wave"}`}
                >
                  ${I}
                </a>
              `})}
          </nav>
        `:null}

      <div class="grid">
        <div class=${F?"s12 m12 l9":"s12"}>
          <!-- 2. Clean header: title, metadata, tags and reading time -->
          <!-- The title block is a real <header>, which BeerCSS renders as a
              flex column carrying its own 1rem of horizontal padding and a
              surface-container tint. Both are neutralised here: the <main>
              already supplies the page margin, and a coloured band behind the
              title would read as a second card above the article one. The
              spacing below it is the divider's own 1rem, so no margin here. -->
          <header class="no-padding transparent no-margin">
            <!-- Same scale as the document headings: BeerCSS's h3 is 2.25rem,
                which no phone needs as a page title. The .small variant of the
                very same level (1.75rem) keeps it above the sections below it
                instead of collapsing the hierarchy. -->
            <h3
              class=${`bold no-margin wrap ${j.value?"":"small"}`}
            >${p}</h3>
            <div
              class="row wrap small-text secondary-text top-margin small-margin">
              ${b?A`
                  <span class="row no-space">
                    <i class="tiny right-margin tiny-margin">person</i>
                    <span>${b}</span>
                  </span>
                `:null}
              ${E?A`
                  <span class="row no-space">
                    <i class="tiny right-margin tiny-margin">calendar_today</i>
                    <span>${E}</span>
                  </span>
                `:null}
              <span class="row no-space" title="Estimated reading time">
                <i class="tiny right-margin tiny-margin">schedule</i>
                <span>${w} min read</span>
              </span>
              <div class="max"></div>
              ${P?A`
                  <button
                    class="small tertiary no-margin"
                    onClick=${W}
                    aria-expanded=${j.value?Be.value:it.value}
                    aria-label=${j.value?"Show or hide the table of contents":"Open or close the table of contents"}
                    title=${j.value?Be.value?"Hide the contents of this page":"Show the contents of this page":"Contents of this page"}
                  >
                    <i>toc</i>
                    <span>On this page</span>
                  </button>
                `:null}
            </div>
            ${T.length>0?A`
                <div class="row wrap top-margin small-margin">
                  ${T.map(x=>A`
                      <span key=${x} class="chip small secondary-container no-margin">
                        <i class="tiny">label</i>
                        ${x}
                      </span>
                    `)}
                </div>
              `:null}
          </header>

          <!-- The rule that closes the header. BeerCSS has no directional
              border utility: the former border-bottom class simply did not
              exist, and a *divider* is the framework's own separator —
              [class*=divider] paints the 1px line and .medium-divider gives it
              1rem above and below, which is also what keeps the header off the
              first line of the body. -->
          <div class="medium-divider"></div>

          <!-- 3. Article body. BeerCSS styles the bare <article> element as a
              card: 1rem of padding, an elevate1 shadow, a surface-container-low
              background and rounded corners. The view used to cancel that
              padding, which is exactly why the text ran against the card's own
              edge; the card now keeps its padding and the prose sits inside it. -->
          <article class="wrap">
            ${Je(S)}
          </article>

          <!-- 4. Sub-page list (shown right after the article body) -->
          ${u&&u.children&&u.children.length>0?A`
              <section class="top-margin large-margin">
                <p class="bold small-text secondary-text no-margin">
                  Sub-pages (${u.children.length})
                </p>
                <!-- ".vertical" is the stacking utility BeerCSS actually has
                    ("column" is not one of them). A flex column has no gap of
                    its own — the 1rem of a row only runs along the main axis,
                    which here is vertical — so each card carries its own bottom
                    margin: that is what separates the entries, which previously
                    touched each other with no gap at all. -->
                <div class="vertical top-margin small-margin">
                  ${u.children.map(x=>A`
                      <a
                        key=${x.path}
                        href=${Ce(x.path)}
                        class="row wrap border round small-padding surface-container wave bottom-margin small-margin"
                      >
                        <i class="primary-text small">${x.icon||"article"}</i>
                        <div class="max wrap">
                          <div class="bold wrap">${x.title}</div>
                          ${x.description?A`
                              <div class="small-text secondary-text wrap no-margin">
                                ${x.description}
                              </div>
                            `:null}
                        </div>
                        <i class="secondary-text small">chevron_right</i>
                      </a>
                    `)}
                </div>
              </section>
            `:null}

          <!-- 5. Previous/next pager, following the article tree order -->
          ${$||y?A`
              <nav
                class="grid top-margin large-margin"
                aria-label="Article navigation"
              >
                ${$?A`
                    <a
                      href=${Ce($.path)}
                      class="s12 m6 l6 row border round padding wave surface-container-low no-margin"
                    >
                      <i class="secondary-text">arrow_back</i>
                      <div class="max wrap">
                        <div class="small-text secondary-text">
                          Previous
                        </div>
                        <div class="bold wrap">${$.title}</div>
                      </div>
                    </a>
                  `:A`<div class="s12 m6 l6"></div>`}
                ${y?A`
                    <a
                      href=${Ce(y.path)}
                      class="s12 m6 l6 row border round padding wave surface-container-low no-margin"
                    >
                      <div class="max wrap right-align">
                        <div class="small-text secondary-text">
                          Next
                        </div>
                        <div class="bold wrap">${y.title}</div>
                      </div>
                      <i class="secondary-text">arrow_forward</i>
                    </a>
                  `:null}
              </nav>
            `:null}

          <!-- 6. Plain footer, separated by the same kind of rule the header
              uses. BeerCSS sets footer{flex-direction:column; padding:0 1rem;
              background-color:var(--surface-container)}: name and version share
              one span because a second child would drop onto the line below, and
              the padding and the tint are cancelled here for the same reason they
              are cancelled on the header. -->
          <div class="medium-divider"></div>
          <footer class="no-padding transparent vertical-margin small-margin center-align secondary-text small-text">
            <span>Made with mdBlog${a}</span>
          </footer>
        </div>

        <!-- Scrollable summary column on wide screens (l), collapsed either by
            the header button or by this close control of the column itself. -->
        ${F?A`
            <aside class="l l3 left-padding" aria-label="Contents of this page">
              <div class="row no-padding no-space">
                <p class="bold small-text secondary-text no-margin">
                  On this page
                </p>
                <div class="max"></div>
                <button
                  class="circle tiny transparent"
                  onClick=${()=>Be.value=!1}
                  aria-label="Close the table of contents"
                  title="Hide the contents of this page"
                >
                  <i class="small">close</i>
                </button>
              </div>
              <div
                class=${l.value?`scroll ${s.heightClass}`:""}
              >
                <!-- Unclamped wrapper: its natural height is what tells whether
                    the entries below the budget exist at all. -->
                <div
                  ref=${x=>{o.value=x}}
                >
                  <${nn} headings=${_} />
                </div>
              </div>
            </aside>
          `:null}
      </div>

      <!-- Summary as a side panel (positioned dialog) on small and medium screens (s/m) -->
      ${N?A`
          ${it.value?A`
              <div class="overlay active" onClick=${At}></div>
            `:null}
          <dialog
            class=${`right medium-width round surface-container scroll small-padding border ${it.value?"active":""}`}
            aria-label="Table of contents"
          >
            <!-- The panel's own head: label on the left, control on the right.
                BeerCSS has no justify-between — the .max spacer is the only
                mechanism that pushes a row's last child to the far edge — and no
                directional border, so the separator below is a divider. -->
            <div class="row no-padding no-space no-margin">
              <i class="primary-text tiny right-margin tiny-margin">toc</i>
              <span class="bold small-text">On this page</span>
              <div class="max"></div>
              <button
                class="circle tiny transparent"
                onClick=${At}
                aria-label="Close the table of contents"
              >
                <i class="small">close</i>
              </button>
            </div>
            <div class="medium-divider"></div>
            <${nn} headings=${_} onNavigate=${At} />
          </dialog>
        `:null}
    </main>
  `}r(or,"Content");function zi(){return A`
    <${ir} />
    <${rr} />
    <${or} />
  `}r(zi,"App");async function qi(){if(typeof navigator>"u"||!("serviceWorker"in navigator)){console.info("[SW] Service Worker is not supported in this browser."),Re.value=!1;return}try{let e=kn(),t=ve?`${e}sw.js?version=${encodeURIComponent(ve)}`:`${e}sw.js`,n=await navigator.serviceWorker.register(t,{scope:e,type:"module",updateViaCache:"none"});n.update().catch(()=>{}),navigator.serviceWorker.controller&&(Re.value=!0),navigator.serviceWorker.addEventListener("controllerchange",()=>{Re.value=!0}),n.waiting&&n.waiting.postMessage({type:"SKIP_WAITING"}),n.installing&&n.installing.addEventListener("statechange",i=>{i.target.state==="activated"&&(Re.value=!0)})}catch(e){console.warn("[SW] Registration failed:",e),Re.value=!1}}r(qi,"registerServiceWorker");function Ka(e){return JSON.stringify(e).replace(/</g,"\\u003c")}r(Ka,"safeJsonSerialize");function lr(e,t="./mdblog.js"){let n=Ka(e);return`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${Ja(e.title)} - mdBlog</title>
    <meta name="description" content="Documentation powered by Service Worker, Wire Format and Preact Islands" />
    <meta name="theme-color" content="#6750a4" />

    <!-- Web App Manifest -->
    <link rel="manifest" href="./manifest.json" />

    <!-- Favicon SVG Inline -->
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>\u{1F4D1}</text></svg>" />


    <!-- BeerCSS Framework v3.7.12 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.css" />
    <!-- The icon font ships inside beer.min.css as @font-face with font-display:
        block; preloading it starts the woff2 fetch in parallel with the
        stylesheet so the glyphs do not stay invisible behind the CSS round
        trip. Kept in lockstep with the application's own index.html. -->
    <link rel="preload" href="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/material-symbols-outlined.woff2" as="font" type="font/woff2" crossorigin />
    <script type="module" src="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.js"><\/script>

    <!-- Material Dynamic Colors -->
    <script type="module" src="https://cdn.jsdelivr.net/npm/material-dynamic-colors@1.1.2/dist/cdn/material-dynamic-colors.min.js"><\/script>

    <!-- Pre-rendered Wire Format JSON -->
    <script id="__md_wire" type="application/json">${n}<\/script>
  </head>
  <body class="auto">
    <div id="app"></div>
    <script type="module" src="${t}"><\/script>
  </body>
</html>`}r(lr,"defaultShell");function sr(e,t){let n=`<script id="__md_wire" type="application/json">${Ka(t)}<\/script>`;if(e.includes('id="__md_wire"')||e.includes("id='__md_wire'"))return ar(e.replace(/<script[^>]*id=["']__md_wire["'][^>]*>[\s\S]*?<\/script>/i,n),t);let i=/<\/head>/i;if(i.test(e))return ar(e.replace(i,`  ${n}
</head>`),t);let a=/<body[^>]*>/i;return a.test(e)?ar(e.replace(a,`${n}$&`),t):ar(`${n}
${e}`,t)}r(sr,"injectWireShell");function ar(e,t){return e.replace(/<title>[\s\S]*?<\/title>/i,`<title>${Ja(t.title)} - mdBlog</title>`)}r(ar,"replaceTitle");function Ja(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}r(Ja,"escapeHtml");async function ff(e,t){let n=new URL(e,t).href,i=r(a=>a.includes("<head")||a.includes("<body"),"usable");try{let a=await fetch(n,{cache:"no-cache"});if(!a.ok)return null;let o=await a.text();return i(o)?o:null}catch{if(typeof caches>"u")return null;try{let a=await caches.match(n);if(!a)return null;let o=await a.text();return i(o)?o:null}catch{return null}}}r(ff,"readShellTemplate");function hf(e,t,n,i){let a=r(()=>(console.warn(`[sw-adapter] No answer for ${n} within ${t}ms; ending the wait`),i?new Response('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Loading timed out</title></head><body><h6>Still loading</h6><p>The site did not finish answering in time. Reloading usually fixes it.</p></body></html>',{status:504,headers:{"Content-Type":"text/html; charset=utf-8"}}):new Response(JSON.stringify({error:"The document handler did not answer in time",url:n}),{status:504,headers:{"Content-Type":"application/json"}})),"deadlineResponse");return new Promise(o=>{let l=setTimeout(()=>o(a()),t);e.then(s=>{clearTimeout(l),o(s)},s=>{clearTimeout(l),console.error(`[sw-adapter] Error processing ${n}:`,s),o(a())})})}r(hf,"raceWithinDeadline");function Ya(e,t={}){let n=t.basePath??"./articles",i=t.bundlePath??"./mdblog.js",a=t.shellPath??"./index.html",o=t.handlerTimeoutMs??8e3,l=(()=>{let c=typeof self<"u"&&self?.location?.href?self.location.href:void 0;return c?new URL("./",c).pathname:"/"})(),s=typeof self<"u"&&self?.location?.href?self.location.href:void 0;return r(function(u){let h=u.request;if(h.method!=="GET")return!1;let f=new URL(h.url);if(f.searchParams.has("_md_raw")||h.headers.has("Range"))return!1;let{docPath:d,isDoc:p}=tt(f.pathname,n);if(!p)return!1;let b=wn(d,l),E=(h.headers.get("Accept")??"").includes("text/html");return u.respondWith(hf((async()=>{try{let T=await Ft(b,e,t);if((h.headers.get("Accept")??"").includes("text/html")){let S=await ff(a,s??f.href),_=S?sr(S,T):lr(T,i);return new Response(_,{status:200,headers:{"Content-Type":"text/html; charset=utf-8","X-Rendered-By":"SW-Wire-Format","X-Doc-Title":encodeURIComponent(T.title)}})}return new Response(JSON.stringify(T),{status:200,headers:{"Content-Type":"application/json; charset=utf-8","X-Rendered-By":"SW-Wire-Format","X-Doc-Title":encodeURIComponent(T.title)}})}catch(T){return console.error(`[sw-adapter] Error processing ${f.pathname}:`,T),new Response(JSON.stringify({error:T instanceof Error?T.message:String(T),url:f.pathname}),{status:404,headers:{"Content-Type":"application/json"}})}})(),o,f.pathname,E)),!0},"handleFetch")}r(Ya,"createSWFetchHandler");var pf=Or;function Xa(e,...t){return A(e,...t)}r(Xa,"html");function df(e){return V(e)}r(df,"signal");function mf(e){return ke(e)}r(mf,"useSignal");function gf(e){return je(e)}r(gf,"computed");function xf(e){return pe(e)}r(xf,"effect");function bf(e){return Ot(e)}r(bf,"batch");var el={countWireIslands:Kn,countWireNodes:Qn,createBrowserIO:Yn,createMemoryIO:Wa,createSWFetchHandler:Ya,defaultShell:lr,injectWireShell:sr,isSWControlling:bn,loadDoc:Ft,mdastToWire:Jn,parseMarkdown:Gn,processMarkdown:Di,resolveDocPath:tt,sanitizeProps:xe,slugify:yn,toBaseRelativePath:wn,version:ve};var e0=el;typeof globalThis<"u"&&(globalThis.mdBlog={App:zi,Navbar:rr,Sidebar:ir,Content:or,ThemeToggle:Tn,SearchBox:nr,Toc:nn,initRouter:Pi,navigateTo:dt,registerServiceWorker:qi,state:pf,mdTranspiler:el,hydrateIslands:pt,html:Xa,signal:df,useSignal:mf,computed:gf,effect:xf,batch:bf,h:Y,render:Ue,hydrate:wr,Component:$e,Fragment:ge,useState:po,useEffect:We,useRef:_r,useMemo:Xe,useCallback:mo,useContext:go});async function Za(){let e=document.getElementById("app");!e&&document.body&&(e=document.createElement("div"),e.id="app",document.body.appendChild(e));let t=zi,n=typeof globalThis<"u"?globalThis:null;if(n&&typeof n.mdBlogApp=="function")t=n.mdBlogApp;else if(document.querySelector('script[src*="app.js"]')||n?.mdBlogEnableAppJs)try{let a=await new Function("path","return import(path)")("./app.js").catch(()=>null);a&&(typeof a.App=="function"?t=a.App:typeof a.default=="function"&&(t=a.default))}catch{}e&&Ue(Xa`<${t} />`,e),Pi(),qi()}r(Za,"bootstrap");typeof document<"u"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{Za().catch(e=>console.error("[mdBlog] Bootstrap error:",e))}):Za().catch(e=>console.error("[mdBlog] Bootstrap error:",e)));export{zi as App,or as Content,rr as Navbar,nr as SearchBox,ir as Sidebar,Tn as ThemeToggle,nn as Toc,Ce as articleHrefFromPath,bf as batch,gf as computed,Kn as countWireIslands,Qn as countWireNodes,Yn as createBrowserIO,Wa as createMemoryIO,Ya as createSWFetchHandler,e0 as default,$i as defaultRegistry,lr as defaultShell,we as dynamicIslandsCache,xf as effect,Pr as estimateReadingTimeMinutes,Fr as extractTocHeadings,$r as findAdjacentArticles,Xa as html,pt as hydrateIslands,Pi as initRouter,sr as injectWireShell,bn as isSWControlling,Ft as loadDoc,el as mdTranspiler,Jn as mdastToWire,dt as navigateTo,ce as normalizePath,Gn as parseMarkdown,Di as processMarkdown,qi as registerServiceWorker,tt as resolveDocPath,xe as sanitizeProps,df as signal,yn as slugify,pf as state,wn as toBaseRelativePath,mf as useSignal,ve as version,Je as wireToVNode};

````

---

## File: `packages/mdblog/src/components/App.ts`

````ts
import { html, } from "htm/preact";
import type { VNode, } from "preact";
import { Navbar, } from "./Navbar.ts";
import { Sidebar, } from "./Sidebar.ts";
import { Content, } from "./Content.ts";

/**
 * @description Main application layout component assembling Navbar, Sidebar, and Content.
 * @returns Preact VNode representing the top-level mdBlog layout.
 * @example
 * ```ts
 * import { App } from "./App.ts";
 * import { render, html } from "htm/preact";
 * render(html`<${App} />`, document.getElementById("app")!);
 * ```
 */
export function App(): unknown {
  // The drawer is rendered before the bar: both use `z-index: 100` in BeerCSS,
  // so the DOM order decides the stacking — this way the top bar stays clickable
  // even with the side menu open.
  return html`
    <${Sidebar} />
    <${Navbar} />
    <${Content} />
  `;
}

````

---

## File: `packages/mdblog/src/components/Content.ts`

````ts
import { html, } from "htm/preact";
import { useSignal, } from "@preact/signals";
import { useEffect, } from "preact/hooks";
import {
  type ArticleItem,
  articles,
  closeTocModal,
  currentDoc,
  currentPath,
  errorMessage,
  isLoading,
  isWideScreen,
  tocModalOpen,
  tocRailOpen,
  toggleTocModal,
  viewportHeight,
} from "../state.ts";
import { wireToVNode, } from "../render/from-wire.ts";
import { hydrateIslands, } from "../render/hydrate-islands.ts";
import { Toc, } from "./Toc.ts";
import { APP_VERSION, } from "../version.ts";
import {
  articleHrefFromPath,
  estimateReadingTimeMinutes,
  extractTocHeadings,
  findAdjacentArticles,
  normalizePath,
  tocRailHeight,
} from "../utils.ts";
import type { WireComponent, WireFragment, } from "../plugin/wire.ts";

/**
 * @description Main document content reader component rendering breadcrumbs, article metadata, table of contents, Wire AST body, prev/next pager, and footer.
 * @returns Preact VNode representing the main reading view.
 * @example
 * ```ts
 * import { Content } from "./Content.ts";
 * import { html } from "htm/preact";
 * const node = html`<${Content} />`;
 * ```
 */
export function Content(): unknown {
  const doc = currentDoc.value;
  const path = currentPath.value;
  const loading = isLoading.value;
  const error = errorMessage.value;

  // The footer carries the build version so that one can tell, without opening
  // the console, that the bundle being served is the latest compile: it reads
  // "major.minor.patch#buildHash", and the suffix is the build instant. It comes
  // out empty when the module is consumed without a bundle (no build-time
  // define), so it is dropped rather than leaving a loose space in the text.
  const versionSuffix = APP_VERSION ? ` ${APP_VERSION}` : "";

  // The rail column is only as tall as the screen allows, and it scrolls solely
  // when entries fall out of that budget: BeerCSS `.scroll` is `overflow:auto`,
  // so a short summary keeps its natural height instead of leaving a tall empty
  // box in the column, and a long one gets the bar as soon as items are cut off.
  // The inner box is never clamped, so it keeps reporting the natural height of
  // the list even after the outer one already scrolls.
  const railList = useSignal<HTMLDivElement | null>(null,);
  const railOverflowing = useSignal(false,);
  const railBudget = tocRailHeight(viewportHeight.value,);

  // Measured after every render on purpose: the rail mounts only once the
  // document arrives, which changes neither the route nor the viewport, so a
  // dependency list would miss exactly the render that creates the list.
  useEffect(() => {
    const list = railList.value;
    railOverflowing.value = !!list &&
      list.offsetHeight > railBudget.maxHeightPx;
  },);

  useEffect(() => {
    if (doc) {
      hydrateIslands();
      if (typeof globalThis !== "undefined" && globalThis.scrollTo) {
        globalThis.scrollTo({ top: 0, },);
      }
    }
  }, [doc, path,],);

  // Two rules that used to live here as component effects are now derived state
  // in state.ts: "widening dismisses the summary modal" and "a new document
  // starts with it closed". Both are consequences of signals this component
  // already reads, so tocModalOpen is a computed — and a component effect that
  // only writes global state would also depend on this view being mounted.

  if (loading && !doc) {
    return html`
      <main class="responsive max padding center-align top-margin">
        <i class="large primary-text">menu_book</i>
        <progress class="circle large"></progress>
        <p class="top-margin secondary-text">
          Loading...
        </p>
      </main>
    `;
  }

  if (error && !doc) {
    return html`
      <main class="responsive max padding">
        <article class="border error-container round padding margin">
          <div class="row">
            <i class="error-text large">error</i>
            <div>
              <h5
                class=${`no-margin bold ${isWideScreen.value ? "" : "small"}`}
              >Could not load the article</h5>
              <p class="top-margin">${error}</p>
            </div>
          </div>
          <div class="top-margin">
            <a class="button primary" href="#/">
              <i>home</i> Go to start
            </a>
          </div>
        </article>
      </main>
    `;
  }

  if (!doc) {
    return html`
      <main class="responsive max padding center-align">
        <p class="secondary-text">No article selected.</p>
      </main>
    `;
  }

  // One normalized-path index for the whole render: the breadcrumb walk below
  // follows parent links through the tree, and re-scanning the flat list per
  // hop is the kind of hidden O(n²) a lookup map settles in one pass.
  const articleByPath = new Map<string, ArticleItem>();
  for (const a of articles.value) {
    articleByPath.set(normalizePath(a.path,), a,);
  }

  const currentArticle = articleByPath.get(normalizePath(path,),);

  // Builds the discreet breadcrumb out of the article hierarchy
  const breadcrumbs: ArticleItem[] = [];
  let curr: ArticleItem | undefined = currentArticle;
  while (curr) {
    breadcrumbs.unshift(curr,);
    if (
      !curr.parentPath ||
      normalizePath(curr.parentPath,) === normalizePath(curr.path,)
    ) break;
    curr = articleByPath.get(normalizePath(curr.parentPath,),);
  }

  const rootArticle = articles.value.find(
    (a,) =>
      a.depth === 0 || a.name === "index.md" || a.path.endsWith("/index.md",),
  );
  if (
    rootArticle && breadcrumbs.length > 0 &&
    breadcrumbs[0] && breadcrumbs[0].path !== rootArticle.path
  ) {
    breadcrumbs.unshift(rootArticle,);
  }

  // Title, author and date taken from the frontmatter or from the metadata
  const title = doc.frontmatter?.title || currentArticle?.title || doc.title ||
    "Article";
  const author = doc.frontmatter?.author || currentArticle?.author;
  const date = doc.frontmatter?.date || currentArticle?.date;
  const tags: string[] = Array.isArray(currentArticle?.tags,)
    ? currentArticle!.tags!
    : Array.isArray(doc.frontmatter?.tags,)
    ? doc.frontmatter.tags as string[]
    : [];
  const readingTime = estimateReadingTimeMinutes(doc.raw || "",);

  // Drops the leading h1 of the markdown body when the header already shows it
  let renderWire = doc.wire;
  if (
    renderWire &&
    renderWire.t === "f" &&
    Array.isArray(renderWire.c,) &&
    renderWire.c.length > 0
  ) {
    const firstNode = renderWire.c[0] as WireComponent | undefined;
    if (
      firstNode &&
      firstNode.t === "c" &&
      firstNode.n === "Heading" &&
      (firstNode.p?.depth === 1 || (firstNode.p?.depth as unknown) === "1")
    ) {
      renderWire = {
        ...renderWire,
        c: renderWire.c.slice(1,),
      } as WireFragment;
    }
  }

  const toc = extractTocHeadings(renderWire,);
  const hasToc = toc.length >= 2;
  const { prev, next, } = findAdjacentArticles(articles.value, path,);

  // The summary always has one control point, at any width: on wide screens the
  // header button toggles its own column (persisted preference); on narrow ones
  // it opens the modal panel, which must not stay open between articles.
  const showRail = hasToc && isWideScreen.value && tocRailOpen.value;
  const showTocPanel = hasToc && !isWideScreen.value;

  function toggleToc(): void {
    if (isWideScreen.value) {
      tocRailOpen.value = !tocRailOpen.value;
    } else {
      toggleTocModal();
    }
  }

  return html`
    <main class="responsive max padding">
      <!-- 1. Discreet compact breadcrumb that wraps -->
      ${breadcrumbs.length > 1
        ? html`
          <nav
            class="row wrap no-space small-text secondary-text bottom-margin">
            ${breadcrumbs.map((crumb, idx,) => {
              const isLast = idx === breadcrumbs.length - 1;
              const label = (idx === 0 &&
                  (crumb.name === "index.md" ||
                    crumb.path.endsWith("/index.md",)))
                ? "Start"
                : crumb.title;
              return html`
                ${idx > 0
                  ? html`<i class="tiny tiny-margin medium-opacity">chevron_right</i>`
                  : null}
                <a
                  href=${articleHrefFromPath(crumb.path,)}
                  class=${`wrap ${
                    isLast ? "bold primary-text" : "secondary-text wave"
                  }`}
                >
                  ${label}
                </a>
              `;
            },)}
          </nav>
        `
        : null}

      <div class="grid">
        <div class=${showRail ? "s12 m12 l9" : "s12"}>
          <!-- 2. Clean header: title, metadata, tags and reading time -->
          <!-- The title block is a real <header>, which BeerCSS renders as a
              flex column carrying its own 1rem of horizontal padding and a
              surface-container tint. Both are neutralised here: the <main>
              already supplies the page margin, and a coloured band behind the
              title would read as a second card above the article one. The
              spacing below it is the divider's own 1rem, so no margin here. -->
          <header class="no-padding transparent no-margin">
            <!-- Same scale as the document headings: BeerCSS's h3 is 2.25rem,
                which no phone needs as a page title. The .small variant of the
                very same level (1.75rem) keeps it above the sections below it
                instead of collapsing the hierarchy. -->
            <h3
              class=${`bold no-margin wrap ${
                isWideScreen.value ? "" : "small"
              }`}
            >${title}</h3>
            <div
              class="row wrap small-text secondary-text top-margin small-margin">
              ${author
                ? html`
                  <span class="row no-space">
                    <i class="tiny right-margin tiny-margin">person</i>
                    <span>${author}</span>
                  </span>
                `
                : null}
              ${date
                ? html`
                  <span class="row no-space">
                    <i class="tiny right-margin tiny-margin">calendar_today</i>
                    <span>${date}</span>
                  </span>
                `
                : null}
              <span class="row no-space" title="Estimated reading time">
                <i class="tiny right-margin tiny-margin">schedule</i>
                <span>${readingTime} min read</span>
              </span>
              <div class="max"></div>
              ${hasToc
                ? html`
                  <button
                    class="small tertiary no-margin"
                    onClick=${toggleToc}
                    aria-expanded=${isWideScreen.value
                      ? tocRailOpen.value
                      : tocModalOpen.value}
                    aria-label=${isWideScreen.value
                      ? "Show or hide the table of contents"
                      : "Open or close the table of contents"}
                    title=${isWideScreen.value
                      ? (tocRailOpen.value
                        ? "Hide the contents of this page"
                        : "Show the contents of this page")
                      : "Contents of this page"}
                  >
                    <i>toc</i>
                    <span>On this page</span>
                  </button>
                `
                : null}
            </div>
            ${tags.length > 0
              ? html`
                <div class="row wrap top-margin small-margin">
                  ${tags.map((tag,) =>
                    html`
                      <span key=${tag} class="chip small secondary-container no-margin">
                        <i class="tiny">label</i>
                        ${tag}
                      </span>
                    `
                  )}
                </div>
              `
              : null}
          </header>

          <!-- The rule that closes the header. BeerCSS has no directional
              border utility: the former border-bottom class simply did not
              exist, and a *divider* is the framework's own separator —
              [class*=divider] paints the 1px line and .medium-divider gives it
              1rem above and below, which is also what keeps the header off the
              first line of the body. -->
          <div class="medium-divider"></div>

          <!-- 3. Article body. BeerCSS styles the bare <article> element as a
              card: 1rem of padding, an elevate1 shadow, a surface-container-low
              background and rounded corners. The view used to cancel that
              padding, which is exactly why the text ran against the card's own
              edge; the card now keeps its padding and the prose sits inside it. -->
          <article class="wrap">
            ${wireToVNode(renderWire,)}
          </article>

          <!-- 4. Sub-page list (shown right after the article body) -->
          ${currentArticle && currentArticle.children &&
              currentArticle.children.length > 0
            ? html`
              <section class="top-margin large-margin">
                <p class="bold small-text secondary-text no-margin">
                  Sub-pages (${currentArticle.children.length})
                </p>
                <!-- ".vertical" is the stacking utility BeerCSS actually has
                    ("column" is not one of them). A flex column has no gap of
                    its own — the 1rem of a row only runs along the main axis,
                    which here is vertical — so each card carries its own bottom
                    margin: that is what separates the entries, which previously
                    touched each other with no gap at all. -->
                <div class="vertical top-margin small-margin">
                  ${currentArticle.children.map((sub,) =>
                    html`
                      <a
                        key=${sub.path}
                        href=${articleHrefFromPath(sub.path,)}
                        class="row wrap border round small-padding surface-container wave bottom-margin small-margin"
                      >
                        <i class="primary-text small">${sub.icon ||
                          "article"}</i>
                        <div class="max wrap">
                          <div class="bold wrap">${sub.title}</div>
                          ${sub.description
                            ? html`
                              <div class="small-text secondary-text wrap no-margin">
                                ${sub.description}
                              </div>
                            `
                            : null}
                        </div>
                        <i class="secondary-text small">chevron_right</i>
                      </a>
                    `
                  )}
                </div>
              </section>
            `
            : null}

          <!-- 5. Previous/next pager, following the article tree order -->
          ${prev || next
            ? html`
              <nav
                class="grid top-margin large-margin"
                aria-label="Article navigation"
              >
                ${prev
                  ? html`
                    <a
                      href=${articleHrefFromPath(prev.path,)}
                      class="s12 m6 l6 row border round padding wave surface-container-low no-margin"
                    >
                      <i class="secondary-text">arrow_back</i>
                      <div class="max wrap">
                        <div class="small-text secondary-text">
                          Previous
                        </div>
                        <div class="bold wrap">${prev.title}</div>
                      </div>
                    </a>
                  `
                  : html`<div class="s12 m6 l6"></div>`}
                ${next
                  ? html`
                    <a
                      href=${articleHrefFromPath(next.path,)}
                      class="s12 m6 l6 row border round padding wave surface-container-low no-margin"
                    >
                      <div class="max wrap right-align">
                        <div class="small-text secondary-text">
                          Next
                        </div>
                        <div class="bold wrap">${next.title}</div>
                      </div>
                      <i class="secondary-text">arrow_forward</i>
                    </a>
                  `
                  : null}
              </nav>
            `
            : null}

          <!-- 6. Plain footer, separated by the same kind of rule the header
              uses. BeerCSS sets footer{flex-direction:column; padding:0 1rem;
              background-color:var(--surface-container)}: name and version share
              one span because a second child would drop onto the line below, and
              the padding and the tint are cancelled here for the same reason they
              are cancelled on the header. -->
          <div class="medium-divider"></div>
          <footer class="no-padding transparent vertical-margin small-margin center-align secondary-text small-text">
            <span>Made with mdBlog${versionSuffix}</span>
          </footer>
        </div>

        <!-- Scrollable summary column on wide screens (l), collapsed either by
            the header button or by this close control of the column itself. -->
        ${showRail
          ? html`
            <aside class="l l3 left-padding" aria-label="Contents of this page">
              <div class="row no-padding no-space">
                <p class="bold small-text secondary-text no-margin">
                  On this page
                </p>
                <div class="max"></div>
                <button
                  class="circle tiny transparent"
                  onClick=${() => (tocRailOpen.value = false)}
                  aria-label="Close the table of contents"
                  title="Hide the contents of this page"
                >
                  <i class="small">close</i>
                </button>
              </div>
              <div
                class=${railOverflowing.value
                  ? `scroll ${railBudget.heightClass}`
                  : ""}
              >
                <!-- Unclamped wrapper: its natural height is what tells whether
                    the entries below the budget exist at all. -->
                <div
                  ref=${(el: HTMLDivElement | null,) => {
                    railList.value = el;
                  }}
                >
                  <${Toc} headings=${toc} />
                </div>
              </div>
            </aside>
          `
          : null}
      </div>

      <!-- Summary as a side panel (positioned dialog) on small and medium screens (s/m) -->
      ${showTocPanel
        ? html`
          ${tocModalOpen.value
            ? html`
              <div class="overlay active" onClick=${closeTocModal}></div>
            `
            : null}
          <dialog
            class=${`right medium-width round surface-container scroll small-padding border ${
              tocModalOpen.value ? "active" : ""
            }`}
            aria-label="Table of contents"
          >
            <!-- The panel's own head: label on the left, control on the right.
                BeerCSS has no justify-between — the .max spacer is the only
                mechanism that pushes a row's last child to the far edge — and no
                directional border, so the separator below is a divider. -->
            <div class="row no-padding no-space no-margin">
              <i class="primary-text tiny right-margin tiny-margin">toc</i>
              <span class="bold small-text">On this page</span>
              <div class="max"></div>
              <button
                class="circle tiny transparent"
                onClick=${closeTocModal}
                aria-label="Close the table of contents"
              >
                <i class="small">close</i>
              </button>
            </div>
            <div class="medium-divider"></div>
            <${Toc} headings=${toc} onNavigate=${closeTocModal} />
          </dialog>
        `
        : null}
    </main>
  `;
}

````

---

## File: `packages/mdblog/src/components/Navbar.ts`

````ts
import { html, } from "htm/preact";
import { isOffline, isSWActive, isWideScreen, sidebarOpen, } from "../state.ts";
import { ThemeToggle, } from "./ThemeToggle.ts";
import { SearchBox, } from "./SearchBox.ts";

/**
 * @description Top navigation bar component displaying logo, network status chip, search input, and theme toggle.
 * @returns Preact VNode representing the application header.
 * @example
 * ```ts
 * import { Navbar } from "./Navbar.ts";
 * import { html } from "htm/preact";
 * const node = html`<${Navbar} />`;
 * ```
 */
export function Navbar(): unknown {
  return html`
    <!-- BeerCSS gives nav.top a justify-content:space-around below 600px and
        freezes the bar at 5rem, while every direct child is flex:none and
        therefore cannot shrink: with the default 1rem gap of a nav the brand,
        the status chip and the two icon buttons overflowed a 375px screen and
        the theme toggle fell off the right edge. The no-space class drops the
        gaps between the bar's own children (the .max spacer still pushes the
        actions to the end) and the wordmark steps down to h6.small. -->
    <nav class="top surface-container no-space elevate">
      <button
        class="circle transparent"
        onClick=${() => (sidebarOpen.value = !sidebarOpen.value)}
        aria-label="Toggle side menu"
        aria-expanded=${sidebarOpen.value}
        title=${sidebarOpen.value
          ? "Hide the article list"
          : "Show the article list"}
      >
        <i>${sidebarOpen.value ? "keyboard_arrow_left" : "menu"}</i>
      </button>

      <!-- BeerCSS treats every direct "a" child of nav.top as a navigation item
          (flex-direction: column, a fixed 3.5rem width and an icon that gets a
          pill radius plus secondary-container background on hover) — which
          stacks the icon over the name and makes it look like a badge. Wrapping
          the brand in a neutral container keeps the link out of that selector.
          The gap between the icon and the wordmark cannot come from a
          gap-small class (BeerCSS has none: the row keeps its default 1rem),
          so the icon carries an explicit right margin. The link keeps its
          vertical padding but not the 0.75rem of padding on each side: that is
          the one place the bar can lose 16px without anything reading tighter,
          and the space it frees is what keeps the theme toggle on screen when
          the phone is narrow or the user has the system text size turned up. -->
      <div class="row no-margin no-space">
        <a
          href="#/"
          class="row wave transparent no-margin horizontal-padding tiny-padding"
          title="Home page"
        >
          <i class="primary-text bold right-margin small-margin">menu_book</i>
          <h6 class="bold no-margin small">mdBlog</h6>
        </a>
      </div>

      <div class="max"></div>

      <div class="row no-space">
        <!-- The status chip, the search and the theme toggle are one group at the
            end of the bar, not three stations spread over it. The 1rem gap of a
            row cost 32px of the bar and, on the narrowest phones, pushed the
            theme toggle past the right edge — a nav does not wrap and clips what
            falls off. The no-space class drops the gap and the two items after
            the chip take the 0.5rem inline margin BeerCSS itself gives a button:
            enough separation to read as distinct targets, half of what it was. -->
        <!-- Connectivity status chip. The word and the roomy padding come with
            the wide layout and the icon alone with the narrow one: the two
            states branch in the DOM on the same signal, the way the search
            trigger already does, instead of through BeerCSS's s/m/l classes.
            A chip holding only an icon is mostly padding, and on the phone that
            padding is the difference between the bar fitting and the theme
            toggle falling off the edge, so the icon-only state keeps 0.25rem of
            it and the labelled state keeps the framework's own. -->
        <span
          class=${`chip small no-margin ${
            isWideScreen.value ? "" : "horizontal-padding tiny-padding"
          } ${
            isOffline.value ? "error-container" : "surface-container-highest"
          }`}
          title=${isOffline.value
            ? "Offline (no connection)"
            : isSWActive.value
            ? "Online (Service Worker active)"
            : "Online"}
        >
          <i class=${isOffline.value ? "error-text" : "green-text"}>
            ${isOffline.value ? "cloud_off" : "cloud_done"}
          </i>
          ${isWideScreen.value
            ? html`<span>${isOffline.value ? "Offline" : "Online"}</span>`
            : null}
        </span>

        <!-- Responsive search: field on m/l, compact button on s -->
        <${SearchBox}
          placeholder="Search articles..."
          class="left-margin small-margin"
        />

        <${ThemeToggle} class="left-margin small-margin" />
      </div>
    </nav>
  `;
}

````

---

## File: `packages/mdblog/src/components/SearchBox.ts`

````ts
import { html, } from "htm/preact";
import { useSignal, } from "@preact/signals";
import { useEffect, } from "preact/hooks";
import {
  closeSearch,
  isWideScreen,
  openSearch,
  searchDocs,
  searchOpen,
  searchQuery,
} from "../state.ts";
import { navigateTo, } from "../router.ts";
import { articleHrefFromPath, } from "../utils.ts";

/**
 * @description Properties accepted by the SearchBox component.
 */
export interface SearchBoxProps {
  /** @description Placeholder text displayed in search input. */
  placeholder?: string;
  /**
   * @description Extra classes added to the trigger element, so the bar it sits in can space it (BeerCSS rows keep a 1rem gap unless the row is told to have none).
   */
  class?: string;
}

/**
 * @description Search box component with responsive trigger (input on desktop, icon button on mobile), interactive dialog, keyboard shortcuts (Ctrl/Cmd+K to open, Escape to close), auto-indexed full-text search, and quick navigation.
 * @param props - Search configuration, including the spacing classes of the container.
 * @returns Preact VNode representing the search trigger and dialog.
 * @example
 * ```ts
 * import { SearchBox } from "./SearchBox.ts";
 * import { html } from "htm/preact";
 * const node = html`<${SearchBox} placeholder="Search..." />`;
 * ```
 */
export function SearchBox({
  placeholder = "Search articles...",
  class: extraClass = "",
}: SearchBoxProps = {},): unknown {
  // The typed query is global state, not local: the module-level shortcut
  // handler has to discard it when `Escape` dismisses the dialog, and an
  // alias keeps the template below reading exactly as it did before.
  const query = searchQuery;
  const panelInput = useSignal<HTMLInputElement | null>(null,);

  // The focus is placed explicitly rather than with the `autofocus` attribute:
  // BeerCSS shows a dialog by adding .active, and an attribute processed while
  // the element is still hidden does nothing — Chrome then reports
  // "Autofocus processing was blocked because a document already has a focused
  // element", because the control that opened the panel keeps its focus. Without
  // the call below, opening the search from the icon button would take two taps.
  // This is the one effect that genuinely belongs to the component: the dialog
  // element only exists once `searchOpen` turned true, and a signal effect runs
  // before the DOM is committed, so there would be nothing to focus yet.
  //
  // The restore of the persisted index and the Ctrl/Cmd+K and Escape handlers
  // used to live here too; they now sit with the state they drive —
  // `restoreSearchIndexFromCache()` inside `loadArticles()` and the keydown
  // listener at the bottom of state.ts — so the shortcuts work whether or not
  // this component happens to be mounted.
  useEffect(() => {
    if (searchOpen.value) panelInput.value?.focus();
  }, [searchOpen.value,],);

  const trimmed = query.value.trim().toLowerCase();
  const indexedCount = searchDocs.value.length;
  const results = trimmed === "" ? [] : searchDocs.value.filter((doc,) => {
    const matchTitle = doc.title.toLowerCase().includes(trimmed,);
    const matchDesc = doc.description &&
      doc.description.toLowerCase().includes(trimmed,);
    const matchContent = doc.content &&
      doc.content.toLowerCase().includes(trimmed,);
    const matchTags = Array.isArray(doc.tags,) &&
      doc.tags.some((tag,) => tag.toLowerCase().includes(trimmed,));
    return matchTitle || matchDesc || matchContent || matchTags;
  },).slice(0, 10,);

  function handleSelect(path: string,): void {
    closeSearch();
    navigateTo(path,);
  }

  function handleClose(): void {
    closeSearch();
  }

  return html`
    <div class=${`row no-margin ${extraClass}`.trim()}>
      <!-- The two triggers are mutually exclusive in the DOM rather than through
          breakpoint classes: BeerCSS's s/m/l classes stop hiding either one at
          fractional widths (browser zoom between 600 and 601, or between 992 and
          993), which would show both and blow up the bar. Narrow screens only
          have room for the icon button anyway. -->
      ${isWideScreen.value
        ? html`
          <div
            class="field prefix round fill small surface-container-highest no-margin"
            onClick=${openSearch}
            title="Search (Ctrl+K)"
          >
            <i class="front">search</i>
            <input
              type="search"
              placeholder=${placeholder}
              value=${query.value}
              aria-label="Search articles"
              aria-keyshortcuts="Control+K Meta+K"
              onFocus=${openSearch}
              onInput=${(e: Event,) => {
                query.value = (e.target as HTMLInputElement).value;
                openSearch();
              }}
            />
          </div>
        `
        : html`
          <button
            class="circle transparent"
            onClick=${openSearch}
            aria-label="Search articles"
            title="Search (Ctrl+K)"
          >
            <i>search</i>
          </button>
        `}

      <!-- Result panel: BeerCSS's native dialog (z-index 100). On wide screens
          it is a centered fixed-width card; on narrow ones it fills the whole
          screen, which is the most readable way to present a result list on a
          phone. The dialog already brings overflow-y:auto and max-block-size, so
          it needs no scroll class of its own. -->
      ${searchOpen.value
        ? html`
          <div class="overlay active" onClick=${handleClose}></div>

          <dialog
            class=${isWideScreen.value ? "active large-width" : "active max"}
            aria-label="Search articles"
          >
            <!-- Title on the left, actions pushed to the right edge. A <header>
                does not work here: BeerCSS gives it flex-direction:column and
                justify-content:center, which would stack the "Esc" chip and the
                close button in the middle of the panel. The .max spacer (flex:1)
                is the only right-alignment mechanism available — the framework
                has no justify-between. -->
            <div class="row no-margin">
              <i class="primary-text">search</i>
              <h6
                class=${`bold no-margin ${isWideScreen.value ? "" : "small"}`}
              >Search articles</h6>
              <div class="max"></div>
              ${isWideScreen.value
                ? html`
                  <span class="chip" title="Close with the Esc key">Esc</span>
                `
                : null}
              <button
                class="circle transparent"
                onClick=${handleClose}
                aria-label="Close search"
                title="Close (Esc)"
              >
                <i>close</i>
              </button>
            </div>

            <!-- The .field uses neither fill nor border: it keeps BeerCSS's
                elevate1, which is the right contrast against the dialog
                background. The icons carry .front because the absolute children
                of a field are painted in document order and the input, being
                relative, would end up on top of the last one, making "clear"
                unclickable. -->
            <div
              class=${query.value
                ? "field prefix suffix round no-margin"
                : "field prefix round no-margin"}
            >
              <i class="front">search</i>
              <input
                type="search"
                placeholder=${placeholder}
                value=${query.value}
                aria-label="Search articles"
                aria-keyshortcuts="Control+K Meta+K"
                ref=${(el: HTMLInputElement | null,) => {
                  panelInput.value = el;
                }}
                onInput=${(e: Event,) => {
                  query.value = (e.target as HTMLInputElement).value;
                }}
              />
              ${query.value
                ? html`
                  <i
                    class="front link"
                    title="Clear search"
                    onClick=${() => {
                      query.value = "";
                      panelInput.value?.focus();
                    }}
                  >
                    close
                  </i>
                `
                : null}
            </div>

            ${trimmed === ""
              ? html`
                <div class="row small-padding round surface-container-low">
                  <i class="primary-text">tips_and_updates</i>
                  <div class="max small-text">
                    Search by title, tag or any word of an article.
                  </div>
                  <span class="small-text secondary-text">
                    ${indexedCount} articles
                  </span>
                </div>
              `
              : null}

            ${results.length > 0
              ? html`
                <div class="row small-text secondary-text">
                  <div class="max">
                    ${results.length} result${results.length > 1 ? "s" : ""} for
                    "${query.value}"
                  </div>
                </div>
              `
              : null}

            <!-- BeerCSS zeroes the margins of every "a.row" (its own rule), so
                the gap between cards cannot come from the flow: small-margin +
                vertical-margin write var(---margin) with !important and separate
                the rows without taking their full width. The text column also
                needs .truncate: a flexbox item whose overflow is not "visible"
                gets a zero minimum size, and without it the text of a single
                line (white-space:nowrap) would push .max to the full width of
                the sentence — cutting the title in half and throwing the arrow
                outside the panel. -->
            <div class="vertical-margin small-margin" aria-live="polite">
              ${results.map((doc,) =>
                html`
                  <a
                    key=${doc.path}
                    href=${articleHrefFromPath(doc.path,)}
                    class="row wave round small-padding vertical-margin small-margin surface-container-low"
                    onClick=${(e: Event,) => {
                      e.preventDefault();
                      handleSelect(doc.path,);
                    }}
                  >
                    <i class="primary-text">${doc.icon || "article"}</i>
                    <div class="max truncate">
                      <div class="bold truncate">${doc.title}</div>
                      ${doc.description
                        ? html`
                          <div class="small-text secondary-text truncate">
                            ${doc.description}
                          </div>
                        `
                        : null}
                    </div>
                    <i class="tiny secondary-text">arrow_forward</i>
                  </a>
                `
              )}
            </div>

            ${trimmed !== "" && results.length === 0
              ? html`
                <div
                  class="center-align small-padding round surface-container-low vertical-margin">
                  <i class="primary-text large">search_off</i>
                  <p class="no-margin">
                    No article found for "${query.value}"
                  </p>
                  <p class="small-text secondary-text no-margin">
                    Check the spelling or try a more general word.
                  </p>
                </div>
              `
              : null}
          </dialog>
        `
        : null}
    </div>
  `;
}

````

---

## File: `packages/mdblog/src/components/Sidebar.ts`

````ts
import { html, } from "htm/preact";
import { articles, currentPath, isWideScreen, sidebarOpen, } from "../state.ts";
import { articleHrefFromPath, normalizePath, } from "../utils.ts";

/**
 * @description Collapsible left sidebar drawer displaying hierarchical article navigation. Rendered only when open, so the article reclaims the full width on any breakpoint (BeerCSS reserves inline space solely while a `nav.left` sibling exists).
 * @returns Preact VNode representing the navigation drawer, or null when collapsed.
 * @example
 * ```ts
 * import { Sidebar } from "./Sidebar.ts";
 * import { html } from "htm/preact";
 * const node = html`<${Sidebar} />`;
 * ```
 */
export function Sidebar(): unknown {
  const current = currentPath.value;
  const list = articles.value;

  if (!sidebarOpen.value) return null;

  // On narrow screens the drawer overlaps the content: a `dialog.left` is fixed
  // and does not trigger the `*:has(>nav...drawer.left)` rules, so no width is
  // reserved for the article. On wide screens it stays inline through
  // `nav.drawer` (exactly 20rem reserved), aligning the text with the menu.
  const overlayMode = !isWideScreen.value;

  // The empty `<header>` occupies the strip the top bar would cover, keeping the
  // top of the panel visible and clickable right below it.
  const panel = html`
    <header class="no-padding no-margin"></header>

    <!-- Panel head: label on the left, close control on the right. There is no
        justify-between in BeerCSS — the .max spacer (flex:1) is the mechanism —
        and no directional border, so the separator below is a divider. -->
    <div class="row no-padding no-space">
      <i class="primary-text tiny right-margin tiny-margin">menu_book</i>
      <span class="bold small-text truncate">Articles</span>
      <div class="max"></div>
      <button
        class="circle transparent"
        onClick=${() => (sidebarOpen.value = false)}
        aria-label="Close the side navigation"
        title="Close the side menu"
      >
        <i class="small">close</i>
      </button>
    </div>

    <div class="medium-divider"></div>

    <div class="no-margin">
      ${list.map((item,) => {
        const isActive = normalizePath(current,) === normalizePath(item.path,);
        const depth = item.depth || 0;
        // The depth is shown as padding on the label, not as a margin on the entry:
        // the entries keep no-margin (which is what zeroes the 1rem BeerCSS puts
        // between consecutive blocks), and one size class feeds every margin class
        // of the element at once, so an indent could not be sized independently.
        const indentClass = depth >= 2
          ? "left-padding"
          : depth === 1
          ? "left-padding small-padding"
          : "";

        return html`
          <a
            key=${item.path}
            href=${articleHrefFromPath(item.path,)}
            class=${`row no-space wave round tiny-padding no-margin ${
              isActive ? "primary-container bold" : "transparent"
            }`}
            onClick=${() => {
              if (!isWideScreen.value) sidebarOpen.value = false;
            }}
            title=${item.title}
          >
            <i
              class=${`tiny right-margin tiny-margin ${
                isActive ? "primary-text" : "secondary-text"
              }`}
            >
              ${item.icon || "article"}
            </i>
            <span class=${`max truncate small-text ${indentClass}`}>
              ${item.title}
            </span>
            ${item.badge
              ? html`
                <span
                  class="chip small primary-container left-margin tiny-margin"
                >
                  ${item.badge}
                </span>
              `
              : null}
          </a>
        `;
      },)}
    </div>
  `;

  if (overlayMode) {
    return html`
      <div
        class="overlay active"
        onClick=${() => (sidebarOpen.value = false)}
        onTouchMove=${(e: TouchEvent,) => e.preventDefault()}
      ></div>

      <dialog
        class="left small drawer active scroll surface-container-low small-padding"
        aria-label="Article navigation"
      >
        ${panel}
      </dialog>
    `;
  }

  return html`
    <nav
      class="left drawer scroll surface-container-low elevate small-padding"
      aria-label="Article navigation"
    >
      ${panel}
    </nav>
  `;
}

````

---

## File: `packages/mdblog/src/components/ThemeToggle.ts`

````ts
import { html, } from "htm/preact";
import { useSignal, } from "@preact/signals";

const STORAGE_KEY = "mdblog-theme";

function readSavedTheme(): boolean | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const saved = localStorage.getItem(STORAGE_KEY,);
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return null;
  } catch {
    return null;
  }
}

/**
 * @description Decides whether the toggle starts in dark mode.
 *
 * A saved choice always wins. Without one the page is in BeerCSS `auto` mode,
 * where `material-dynamic-colors` follows the OS palette and no `dark` class is
 * ever written on the body: reading only the class list showed the button
 * offering "switch to dark" on a page that was already dark, so the media query
 * — the very preference the auto mode mirrors — seeds the fallback.
 * @returns True when the effective theme is dark.
 * @example
 * ```ts
 * import { initialThemeIsDark } from "./ThemeToggle.ts";
 * const dark = initialThemeIsDark();
 * ```
 */
export function initialThemeIsDark(): boolean {
  const saved = readSavedTheme();
  if (saved !== null) return saved;
  if (
    typeof document !== "undefined" &&
    document.body.classList.contains("dark",)
  ) {
    return true;
  }
  if (typeof globalThis.matchMedia === "function") {
    return globalThis.matchMedia("(prefers-color-scheme: dark)",).matches;
  }
  return false;
}

/**
 * @description Keeps the `theme-color` meta equal to the painted background.
 *
 * The meta drives the browser chrome and the PWA splash; shipping it as a fixed
 * brand purple left a dark theme with a light-colored status bar. The value is
 * read from the body's computed background — whichever palette is in effect,
 * static BeerCSS or a dynamic one — so no color constant is duplicated here.
 * @example
 * ```ts
 * import { syncThemeColor } from "./ThemeToggle.ts";
 * syncThemeColor();
 * ```
 */
export function syncThemeColor(): void {
  if (typeof document === "undefined") return;
  try {
    const bg = getComputedStyle(document.body,).backgroundColor;
    if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") return;
    let meta = document.querySelector('meta[name="theme-color"]',);
    if (!meta) {
      meta = document.createElement("meta",);
      meta.setAttribute("name", "theme-color",);
      document.head.appendChild(meta,);
    }
    meta.setAttribute("content", bg,);
  } catch {
    // No computed styles available: keep whatever the document shipped
  }
}

function applyTheme(dark: boolean,): void {
  if (typeof document === "undefined") return;
  document.body.classList.remove(dark ? "light" : "dark",);
  document.body.classList.remove("auto",);
  document.body.classList.add(dark ? "dark" : "light",);
  syncThemeColor();
}

/**
 * @description Properties accepted by the ThemeToggle component.
 */
export interface ThemeToggleProps {
  /**
   * @description Extra classes added to the button, so the bar it sits in can space it (BeerCSS rows keep a 1rem gap unless the row is told to have none).
   */
  class?: string;
}

/**
 * @description Button component toggling BeerCSS light and dark color themes on document.body, persisting the choice in localStorage.
 * @param props - Toggle configuration, including the spacing classes of the container.
 * @returns Preact VNode representing the theme toggle button.
 * @example
 * ```ts
 * import { ThemeToggle } from "./ThemeToggle.ts";
 * import { html } from "htm/preact";
 * const node = html`<${ThemeToggle} />`;
 * ```
 */
export function ThemeToggle({
  class: extraClass = "",
}: ThemeToggleProps = {},): unknown {
  const saved = readSavedTheme();
  const isDark = useSignal(initialThemeIsDark(),);

  // Makes sure the saved preference wins over the system "auto" mode
  if (saved !== null) {
    applyTheme(saved,);
  } else {
    // The shipped meta carries the brand color for both modes; in auto mode no
    // applyTheme call follows, so the correction happens right here instead.
    syncThemeColor();
  }

  function toggle(): void {
    isDark.value = !isDark.value;
    applyTheme(isDark.value,);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, isDark.value ? "dark" : "light",);
      }
    } catch {
      // Persistence unavailable (private mode): stays in memory only
    }
  }

  return html`
    <button
      class=${`circle transparent ${extraClass}`.trim()}
      onClick=${toggle}
      title=${isDark.value ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <i>${isDark.value ? "light_mode" : "dark_mode"}</i>
    </button>
  `;
}

````

---

## File: `packages/mdblog/src/components/Toc.ts`

````ts
import { html, } from "htm/preact";
import type { TocHeading, } from "../utils.ts";

/**
 * @description Properties accepted by the Toc component.
 */
export interface TocProps {
  /** @description Ordered heading entries extracted from the current document. */
  headings?: TocHeading[];
  /** @description Optional callback fired after an entry is activated (used to close drawers). */
  onNavigate?: () => void;
}

/**
 * @description Table of contents list rendering anchor links that smooth-scroll to document headings without touching the hash router.
 * @param props - Toc configuration props.
 * @returns Preact VNode representing the toc navigation list, or null when empty.
 * @example
 * ```ts
 * import { Toc } from "./Toc.ts";
 * import { html } from "htm/preact";
 * const node = html`<${Toc} headings=${[{ id: "intro", text: "Intro", depth: 2 }]} />`;
 * ```
 */
export function Toc({ headings = [], onNavigate, }: TocProps = {},): unknown {
  if (!headings.length) return null;

  function scrollTo(id: string,) {
    return (e: Event,): void => {
      e.preventDefault();
      if (typeof document !== "undefined") {
        document.getElementById(id,)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        },);
      }
      onNavigate?.();
    };
  }

  return html`
    <!-- A plain .vertical box, not a nav: BeerCSS gives every nav
        display:flex with align-items:center, so entries inside nav.vertical
        shrink-wrap to their text and float in the middle of the column instead
        of filling it. The accessible name already comes from the aside or the
        dialog this list lives in. -->
    <div class="vertical">
      ${headings.map((heading,) =>
        html`
          <a
            key=${heading.id}
            href="#${heading.id}"
            onClick=${scrollTo(heading.id,)}
            class="row no-space wave round tiny-padding small-text secondary-text no-margin"
            title=${heading.text}
          >
            <!-- The indent is padding on the label, not a margin on the entry:
                .vertical zeroes the inline margins of its children, so a
                left-margin class would silently do nothing here. -->
            <span
              class=${`max truncate ${
                heading.depth >= 3 ? "left-padding small-padding" : ""
              }`}
            >
              ${heading.text}
            </span>
          </a>
        `
      )}
    </div>
  `;
}

````

---

## File: `packages/mdblog/src/mod.ts`

````ts
import {
  Component,
  type ComponentChildren,
  type ComponentType,
  Fragment,
  h,
  hydrate,
  render,
  type VNode,
} from "preact";

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import { html as rawHtml, } from "htm/preact";
import {
  batch as rawBatch,
  computed as rawComputed,
  effect as rawEffect,
  signal as rawSignal,
  useSignal as rawUseSignal,
} from "@preact/signals";
import * as stateNamespace from "./state.ts";
import type { ArticleItem, } from "./state.ts";

/**
 * @description Reactive application state, signals, and dynamic article tree discovery.
 */
export const state: typeof stateNamespace = stateNamespace;

import { App, } from "./components/App.ts";
import { Navbar, } from "./components/Navbar.ts";
import { Sidebar, } from "./components/Sidebar.ts";
import { Content, } from "./components/Content.ts";
import {
  ThemeToggle,
  type ThemeToggleProps,
} from "./components/ThemeToggle.ts";
import { SearchBox, type SearchBoxProps, } from "./components/SearchBox.ts";
import { Toc, type TocProps, } from "./components/Toc.ts";
import { initRouter, navigateTo, } from "./router.ts";
import { registerServiceWorker, } from "./register-sw.ts";
import { APP_VERSION, } from "./version.ts";
import {
  type AdjacentArticles,
  articleHrefFromPath,
  estimateReadingTimeMinutes,
  extractTocHeadings,
  findAdjacentArticles,
  normalizePath,
  type TocHeading,
} from "./utils.ts";
import {
  dynamicIslandsCache,
  hydrateIslands,
  type HydrateOptions,
} from "./render/hydrate-islands.ts";
import {
  type ComponentRegistry,
  wireToVNode,
  type WireToVNodeOptions,
} from "./render/from-wire.ts";
import { defaultRegistry, } from "./render/registry.ts";
import { parseMarkdown, } from "./plugin/core/parse.ts";
import { mdastToWire, } from "./plugin/core/to-wire.ts";
import { loadDoc, processMarkdown, } from "./plugin/core/pipeline.ts";
import {
  type CacheIOOptions,
  createBrowserIO,
  createMemoryIO,
} from "./plugin/core/io.ts";
import {
  createSWFetchHandler,
  type SWFetchEvent,
  type SWPluginOptions,
} from "./plugin/adapters/sw.ts";
import { defaultShell, injectWireShell, } from "./plugin/core/shell.ts";
import type { DocConfig, IO, } from "./plugin/types.ts";
import {
  isSWControlling,
  resolveDocPath,
  slugify,
  toBaseRelativePath,
} from "./plugin/detect.ts";
import {
  countWireIslands,
  countWireNodes,
  type MdastRoot,
  sanitizeProps,
  type Wire,
  type WireComponent,
  type WireDoc,
  type WireElement,
  type WireFragment,
  type WireIsland,
} from "./plugin/wire.ts";

/**
 * @description Reactive Signal container holding a mutable value. The published
 * surface is deliberately this documented shape and not the native
 * `@preact/signals` class: JSR's doc lint refuses a public type that references
 * an undocumented type from npm (`private-type-ref`), and the runtime object
 * already satisfies everything declared here (`value`, plus the inherited
 * `toString`/`valueOf`).
 */
export interface Signal<T = unknown,> {
  /** @description The current reactive value. */
  value: T;
  /** @description Converts signal value to string representation. */
  toString(): string;
  /** @description Returns primitive value. */
  valueOf(): T;
}

/**
 * @description Tagged template literal for JSX/HTML evaluation without a build step.
 * @param strings - Template strings array.
 * @param values - Interpolated values.
 * @returns Renderable Preact virtual element.
 * @example
 * ```ts
 * import { html } from "./mod.ts";
 * const node = html`<div class="banner">Hello World</div>`;
 * ```
 */
export function html(
  strings: TemplateStringsArray,
  ...values: unknown[]
): unknown {
  return rawHtml(strings, ...values,);
}

/**
 * @description Creates a new reactive state signal with an initial value.
 * @param initialValue - Initial value for the signal.
 * @returns A reactive Signal container.
 * @example
 * ```ts
 * import { signal } from "./mod.ts";
 * const count = signal(0);
 * count.value++;
 * ```
 */
export function signal<T,>(initialValue: T,): Signal<T> {
  return rawSignal(initialValue,) as unknown as Signal<T>;
}

/**
 * @description Preact hook for creating a component-scoped reactive signal.
 * @param initialValue - Initial value for the signal.
 * @returns Component-scoped reactive Signal container.
 * @example
 * ```ts
 * import { useSignal } from "./mod.ts";
 * function Counter() {
 *   const count = useSignal(0);
 *   return count.value;
 * }
 * ```
 */
export function useSignal<T,>(initialValue: T,): Signal<T> {
  return rawUseSignal(initialValue,) as unknown as Signal<T>;
}

/**
 * @description Creates a computed reactive value derived from other signals.
 * @param compute - Computation function reading signals.
 * @returns Read-only derived Signal.
 * @example
 * ```ts
 * import { signal, computed } from "./mod.ts";
 * const count = signal(2);
 * const double = computed(() => count.value * 2);
 * ```
 */
export function computed<T,>(compute: () => T,): Readonly<Signal<T>> {
  return rawComputed(compute,) as unknown as Readonly<Signal<T>>;
}

/**
 * @description Subscribes to reactive signals and triggers side-effects upon mutations.
 * @param callback - Function to execute when accessed signals change.
 * @returns Cleanup unsubscribe function.
 * @example
 * ```ts
 * import { signal, effect } from "./mod.ts";
 * const count = signal(0);
 * const dispose = effect(() => console.log(count.value));
 * ```
 */
export function effect(callback: () => void | (() => void),): () => void {
  return rawEffect(callback,);
}

/**
 * @description Batches multiple signal updates into a single notification cycle.
 * @param callback - Function executing multiple signal mutations.
 * @returns Result of the callback execution.
 * @example
 * ```ts
 * import { signal, batch } from "./mod.ts";
 * const a = signal(1);
 * const b = signal(2);
 * batch(() => { a.value = 10; b.value = 20; });
 * ```
 */
export function batch<T,>(callback: () => T,): T {
  return rawBatch(callback,);
}

export {
  App,
  articleHrefFromPath,
  Content,
  countWireIslands,
  countWireNodes,
  createBrowserIO,
  createMemoryIO,
  createSWFetchHandler,
  defaultRegistry,
  defaultShell,
  dynamicIslandsCache,
  estimateReadingTimeMinutes,
  extractTocHeadings,
  findAdjacentArticles,
  hydrateIslands,
  initRouter,
  injectWireShell,
  isSWControlling,
  loadDoc,
  mdastToWire,
  Navbar,
  navigateTo,
  normalizePath,
  parseMarkdown,
  processMarkdown,
  registerServiceWorker,
  resolveDocPath,
  sanitizeProps,
  SearchBox,
  Sidebar,
  slugify,
  ThemeToggle,
  toBaseRelativePath,
  Toc,
  wireToVNode,
};

export type {
  AdjacentArticles,
  ArticleItem,
  CacheIOOptions,
  ComponentRegistry,
  DocConfig,
  HydrateOptions,
  IO,
  MdastRoot,
  SearchBoxProps,
  SWFetchEvent,
  SWPluginOptions,
  ThemeToggleProps,
  TocHeading,
  TocProps,
  Wire,
  WireComponent,
  WireDoc,
  WireElement,
  WireFragment,
  WireIsland,
  WireToVNodeOptions,
};

/**
 * @description Transpiler and Service Worker pipeline suite bundled with mdBlog.
 */
const mdTranspiler = {
  countWireIslands,
  countWireNodes,
  createBrowserIO,
  createMemoryIO,
  createSWFetchHandler,
  defaultShell,
  injectWireShell,
  isSWControlling,
  loadDoc,
  mdastToWire,
  parseMarkdown,
  processMarkdown,
  resolveDocPath,
  sanitizeProps,
  slugify,
  toBaseRelativePath,
  // The build stamp, so a Service Worker — which imports this bundle instead of
  // importing the module graph — can name its caches after the build it holds.
  version: APP_VERSION,
};

export { mdTranspiler, };

export { APP_VERSION as version, } from "./version.ts";
export default mdTranspiler;

// Exposes the library and every primitive on the global scope for direct use in the browser
if (typeof globalThis !== "undefined") {
  (globalThis as Record<string, unknown>).mdBlog = {
    App,
    Navbar,
    Sidebar,
    Content,
    ThemeToggle,
    SearchBox,
    Toc,
    initRouter,
    navigateTo,
    registerServiceWorker,
    state,
    mdTranspiler,
    hydrateIslands,
    // Reactive and rendering primitives for islands.
    //
    // The hooks below are published for user-authored islands, which are plain
    // Preact components and may prefer them. The engine's own components do NOT
    // use them for state: signals are the single state mechanism (see
    // state.ts), and the few useEffect calls that remain exist only to touch
    // the DOM after a commit — focus, measurement, hydration.
    html,
    signal,
    useSignal,
    computed,
    effect,
    batch,
    h,
    render,
    hydrate,
    Component,
    Fragment,
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
    useContext,
  };
}

/**
 * Automatic browser bootstrap:
 * 1. Looks for the #app container (and creates one when it is missing).
 * 2. Tries to load a custom user-provided app.js when one exists.
 * 3. When there is NO app.js, falls back to the default App with every component of the library built in.
 * 4. Starts the reactive router and registers the Service Worker.
 */
async function bootstrap() {
  let root = document.getElementById("app",);
  if (!root && document.body) {
    root = document.createElement("div",);
    root.id = "app";
    document.body.appendChild(root,);
  }

  // 1. Check whether a custom component was provided through window or an app.js file
  let ComponentToMount = App;

  const g = typeof globalThis !== "undefined"
    ? (globalThis as Record<string, unknown>)
    : null;
  if (g && typeof g.mdBlogApp === "function") {
    ComponentToMount = g.mdBlogApp as typeof App;
  } else if (
    document.querySelector('script[src*="app.js"]',) || g?.mdBlogEnableAppJs
  ) {
    try {
      // Try to import app.js dynamically at runtime in the browser, if it exists
      const dynamicImport = new Function("path", "return import(path)",);
      const userModule = await dynamicImport("./app.js",).catch(() => null);
      if (userModule) {
        if (typeof userModule.App === "function") {
          ComponentToMount = userModule.App;
        } else if (typeof userModule.default === "function") {
          ComponentToMount = userModule.default;
        }
      }
    } catch {
      // No app.js found: use the built-in library and its default components
    }
  }

  if (root) {
    render(html`<${ComponentToMount} />` as VNode, root,);
  }

  // Starts the router so the articles are read reactively
  initRouter();

  // Registers the default Service Worker with a relative scope
  registerServiceWorker();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      bootstrap().catch((err,) =>
        console.error("[mdBlog] Bootstrap error:", err,)
      );
    },);
  } else {
    bootstrap().catch((err,) =>
      console.error("[mdBlog] Bootstrap error:", err,)
    );
  }
}

````

---

## File: `packages/mdblog/src/plugin/adapters/client.ts`

````ts
import type { DocConfig, IO, } from "../types.ts";
import type { WireDoc, } from "../wire.ts";
import { isSWControlling, resolveDocPath, } from "../detect.ts";
import { loadDoc, } from "../core/pipeline.ts";

/**
 * @description Creates a local client-side fetcher that executes the pipeline in-browser
 * when the Service Worker is not active or when offline.
 * @param io - IO abstraction instance.
 * @param options - DocConfig options.
 * @returns Function that takes a URL/path and returns a parsed WireDoc.
 * @example
 * ```ts
 * import { createLocalFetcher } from "./client.ts";
 * import { createBrowserIO } from "../core/io.ts";
 * const io = createBrowserIO();
 * const fetcher = createLocalFetcher(io);
 * const doc = await fetcher("/articles/intro.md");
 * ```
 */
export function createLocalFetcher(
  io: IO,
  options: DocConfig = {},
): (urlOrPath: string,) => Promise<WireDoc> {
  const basePath = options.basePath ?? "./articles";

  return async function localFetch(urlOrPath: string,): Promise<WireDoc> {
    const { docPath, } = resolveDocPath(urlOrPath, basePath,);
    return await loadDoc(docPath, io, options,);
  };
}

/**
 * @description Unified client fetcher with transparent Service Worker & local pipeline fallback support.
 * @param urlOrPath - Path to the markdown document.
 * @param io - IO abstraction instance.
 * @param options - DocConfig options.
 * @returns Parsed WireDoc instance.
 * @example
 * ```ts
 * import { mdFetch } from "./client.ts";
 * import { createBrowserIO } from "../core/io.ts";
 * const io = createBrowserIO();
 * const doc = await mdFetch("./articles/index.md", io);
 * ```
 */
export async function mdFetch(
  urlOrPath: string,
  io: IO,
  options: DocConfig = {},
): Promise<WireDoc> {
  const { docPath, } = resolveDocPath(
    urlOrPath,
    options.basePath ?? "./articles",
  );

  // 1. If SW is controlling the page, try fetching with Accept: application/json
  if (isSWControlling()) {
    try {
      const response = await fetch(docPath, {
        headers: { Accept: "application/json", },
      },);
      if (response.ok) {
        const contentType = response.headers.get("content-type",) ?? "";
        if (contentType.includes("application/json",)) {
          const doc: WireDoc = await response.json();
          return doc;
        }
      }
    } catch (err) {
      console.warn(
        `[client-adapter] SW fetch failed, falling back to local:`,
        err,
      );
    }
  }

  // 2. Fallback: process directly via local client pipeline
  const localFetcher = createLocalFetcher(io, options,);
  return await localFetcher(docPath,);
}

````

---

## File: `packages/mdblog/src/plugin/adapters/sw.ts`

````ts
import type { DocConfig, IO, } from "../types.ts";
import { resolveDocPath, toBaseRelativePath, } from "../detect.ts";
import { loadDoc, } from "../core/pipeline.ts";
import { defaultShell, injectWireShell, } from "../core/shell.ts";

/**
 * @description Configuration options for the Service Worker fetch adapter.
 */
export interface SWPluginOptions extends DocConfig {
  /**
   * @description Path to the bundled client script for HTML shell responses.
   * @default "./mdblog.js"
   */
  bundlePath?: string;

  /**
   * @description Path to the application document the first-paint payload is
   * injected into. Served documents get their own head — stylesheets, theme
   * recovery, the mount deadline — instead of a copy written here, which is how
   * a shell ends up loading a different framework release than the app.
   * When it cannot be read, the static fallback document is used instead.
   * @default "./index.html"
   */
  shellPath?: string;

  /**
   * @description Maximum time the handler may take to answer an intercepted
   * request. A promise that never settles keeps the browser spinning the tab
   * forever — the signature of a fetch that neither resolves nor fails, most
   * often a worker whose caches were deleted underneath an open tab. When the
   * deadline passes the request is answered with a 504 that ends the wait and
   * invites a reload, so no wedged dependency can hold a navigation open.
   * @default 8000
   */
  handlerTimeoutMs?: number;
}

/**
 * Reads the document the application ships, so a navigation can be answered
 * with it. Revalidated on every request: a shell served from a cache the reader
 * cannot see is the one thing a first paint must never be.
 */
async function readShellTemplate(
  shellPath: string,
  base: string,
): Promise<string | null> {
  const templateUrl = new URL(shellPath, base,).href;

  const usable = (html: string,): html is string =>
    html.includes("<head",) || html.includes("<body",);

  try {
    const response = await fetch(templateUrl, { cache: "no-cache", },);
    if (!response.ok) return null;
    const html = await response.text();
    return usable(html,) ? html : null;
  } catch {
    // Offline, or a host that does not serve the file. The copy the worker
    // already holds is still the application's own document; anything else would
    // have to be the fallback written above.
    if (typeof caches === "undefined") return null;
    try {
      const cached = await caches.match(templateUrl,);
      if (!cached) return null;
      const html = await cached.text();
      return usable(html,) ? html : null;
    } catch {
      return null;
    }
  }
}

/**
 * @description The minimal shape of the `fetch` event this handler consumes.
 * Declared structurally instead of using the DOM `FetchEvent` type, so the
 * module keeps checking outside a Service Worker context (tests, Deno).
 */
export interface SWFetchEvent {
  /** @description The intercepted request. */
  request: Request;
  /** @description Promise settled with the response to serve. */
  respondWith(response: Response | Promise<Response>,): void;
}

/**
 * Ends the wait when the handling chain never settles: the same race the
 * published shell uses against a never-answering worker, moved to the side of
 * the worker itself, so a wedged fetch or a hanging cache read answers with a
 * deadline response instead of an eternally spinning tab. The timer is cleared
 * as soon as the chain settles, so a fast answer leaves no deadline burning
 * seconds behind it.
 */
function raceWithinDeadline(
  chain: Promise<Response>,
  deadlineMs: number,
  pathname: string,
  wantsHtml: boolean,
): Promise<Response> {
  const deadlineResponse = (): Response => {
    console.warn(
      `[sw-adapter] No answer for ${pathname} within ${deadlineMs}ms; ending the wait`,
    );
    if (wantsHtml) {
      return new Response(
        '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
          "<title>Loading timed out</title></head><body><h6>Still loading</h6>" +
          "<p>The site did not finish answering in time. Reloading usually fixes it.</p>" +
          "</body></html>",
        {
          status: 504,
          headers: { "Content-Type": "text/html; charset=utf-8", },
        },
      );
    }
    return new Response(
      JSON.stringify({
        error: "The document handler did not answer in time",
        url: pathname,
      },),
      {
        status: 504,
        headers: { "Content-Type": "application/json", },
      },
    );
  };

  return new Promise<Response>((resolve,) => {
    const timer = setTimeout(() => resolve(deadlineResponse(),), deadlineMs,);
    chain.then(
      (response,) => {
        clearTimeout(timer,);
        resolve(response,);
      },
      (error,) => {
        clearTimeout(timer,);
        console.error(`[sw-adapter] Error processing ${pathname}:`, error,);
        resolve(deadlineResponse(),);
      },
    );
  },);
}

/**
 * @description Creates a fetch event handler for the Service Worker.
 * Intercepts documentation markdown routes and returns WireDoc JSON or HTML shells.
 * @param io - IO abstraction instance to fetch and cache documents.
 * @param options - Routing and caching options.
 * @returns Event interceptor function returning boolean if request was handled.
 * @example
 * ```ts
 * import { createSWFetchHandler } from "./sw.ts";
 * import { createBrowserIO } from "../core/io.ts";
 * const io = createBrowserIO();
 * const handler = createSWFetchHandler(io, { basePath: "./articles" });
 * ```
 */
export function createSWFetchHandler(
  io: IO,
  options: SWPluginOptions = {},
): (event: SWFetchEvent,) => boolean {
  const basePath = options.basePath ?? "./articles";
  const bundlePath = options.bundlePath ?? "./mdblog.js";
  const shellPath = options.shellPath ?? "./index.html";
  const handlerDeadline = options.handlerTimeoutMs ?? 8000;
  // Everything the site serves lives next to the worker, so its directory is the
  // application's base. A request arrives already resolved by the browser
  // (`/mdBlog/articles/index.md`), and that origin-rooted form is not what the
  // reader asks the network for — see toBaseRelativePath.
  const baseDir = (() => {
    const href = (typeof self !== "undefined" && self?.location?.href)
      ? self.location.href
      : undefined;
    return href ? new URL("./", href,).pathname : "/";
  })();
  // The document belongs next to the worker, not next to the request: an article
  // navigation asks for `../index.html` when resolved against its own path, and
  // a deep link would then be answered with the fallback shell.
  const shellBase = (typeof self !== "undefined" && self?.location?.href) ?
    self.location.href :
    undefined;

  return function handleFetch(event: SWFetchEvent,): boolean {
    const request = event.request;

    // 1. Only intercept GET requests
    if (request.method !== "GET") {
      return false;
    }

    const url = new URL(request.url,);

    // 2. Anti-recursion: pass through raw markdown fetches
    if (url.searchParams.has("_md_raw",)) {
      return false;
    }

    // 3. Skip range requests (media, audio, video)
    if (request.headers.has("Range",)) {
      return false;
    }

    // 4. Check if request targets documentation
    const { docPath, isDoc, } = resolveDocPath(url.pathname, basePath,);
    if (!isDoc) {
      return false;
    }

    // The path of the document below the application's own directory: the same
    // spelling a page fetches it with, which is what the reader resolves.
    const assetPath = toBaseRelativePath(docPath, baseDir,);

    // 5. Intercept and handle. The chain is raced against a deadline: a
    // respondWith whose promise never settles is exactly the spinning tab the
    // published shell's own mount deadline complains about.
    const wantsHtml = (request.headers.get("Accept",) ?? "").includes(
      "text/html",
    );
    event.respondWith(
      raceWithinDeadline(
        (async () => {
          try {
            const doc = await loadDoc(assetPath, io, options,);

            const accept = request.headers.get("Accept",) ?? "";

            // Content negotiation:
            // If browser navigation (text/html): return HTML shell with embedded wire
            if (accept.includes("text/html",)) {
              const template = await readShellTemplate(
                shellPath,
                shellBase ?? url.href,
              );
              const html = template
                ? injectWireShell(template, doc,)
                : defaultShell(doc, bundlePath,);
              return new Response(html, {
                status: 200,
                headers: {
                  "Content-Type": "text/html; charset=utf-8",
                  "X-Rendered-By": "SW-Wire-Format",
                  "X-Doc-Title": encodeURIComponent(doc.title,),
                },
              },);
            }

            // If SPA request (application/json): return pure WireDoc JSON
            return new Response(JSON.stringify(doc,), {
              status: 200,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                "X-Rendered-By": "SW-Wire-Format",
                "X-Doc-Title": encodeURIComponent(doc.title,),
              },
            },);
          } catch (err) {
            console.error(
              `[sw-adapter] Error processing ${url.pathname}:`,
              err,
            );
            return new Response(
              JSON.stringify({
                error: err instanceof Error ? err.message : String(err,),
                url: url.pathname,
              },),
              {
                status: 404,
                headers: { "Content-Type": "application/json", },
              },
            );
          }
        })(),
        handlerDeadline,
        url.pathname,
        wantsHtml,
      ),
    );

    return true;
  };
}

````

---

## File: `packages/mdblog/src/plugin/core/frontmatter.ts`

````ts
/**
 * @description Result structure returned by parseFrontmatter.
 */
export interface ParsedFrontmatter {
  /** @description Parsed key-value metadata object from YAML. */
  frontmatter: Record<string, any>;
  /** @description Markdown content without the YAML frontmatter block. */
  body: string;
}

/**
 * Lightweight, zero-dependency YAML frontmatter parser.
 * Handles scalars, string values, booleans, arrays (lists), and nested arrays of objects.
 */
function parseYAML(yamlStr: string,): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (!yamlStr || !yamlStr.trim()) return result;

  const lines = yamlStr.split(/\r?\n/,);
  let currentKey: string | null = null;
  let currentList: unknown[] | null = null;
  let currentItem: Record<string, unknown> | null = null;

  for (const rawLine of lines) {
    const line = rawLine;
    const stripped = line.trim();
    if (!stripped || stripped.startsWith("#",)) continue;

    // List item: "  - path: 'val'" or "  - 'val'"
    const listItemMatch = line.match(/^(\s*)-\s+(.*)$/,);
    if (listItemMatch && listItemMatch[2] !== undefined && currentKey) {
      if (!currentList) {
        currentList = [];
        result[currentKey] = currentList;
      }
      const rest = listItemMatch[2].trim();
      const propMatch = rest.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/,);
      if (propMatch && propMatch[1] && propMatch[2] !== undefined) {
        currentItem = {};
        currentList.push(currentItem,);
        const k = propMatch[1];
        const val = propMatch[2].trim().replace(/^["'`]|["'`]$/g, "",);
        currentItem[k] = val;
      } else {
        const val = rest.replace(/^["'`]|["'`]$/g, "",);
        currentList.push(val,);
        currentItem = null;
      }
      continue;
    }

    // Indented sub-property of current list item: "    title: 'val'"
    const subPropMatch = line.match(/^\s{2,}([A-Za-z0-9_-]+)\s*:\s*(.*)$/,);
    if (
      subPropMatch && subPropMatch[1] && subPropMatch[2] !== undefined &&
      currentItem
    ) {
      const k = subPropMatch[1];
      const val = subPropMatch[2].trim().replace(/^["'`]|["'`]$/g, "",);
      currentItem[k] = val;
      continue;
    }

    // Top-level key: "key: value" or "key:"
    const topKeyMatch = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/,);
    if (topKeyMatch && topKeyMatch[1] && topKeyMatch[2] !== undefined) {
      const k = topKeyMatch[1];
      const valStr = topKeyMatch[2].trim();
      currentKey = k;
      currentList = null;
      currentItem = null;

      if (!valStr) {
        result[k] = null;
      } else if (valStr.startsWith("[",) && valStr.endsWith("]",)) {
        try {
          result[k] = JSON.parse(valStr,);
        } catch {
          result[k] = valStr.slice(1, -1,).split(",",).map((s,) =>
            s.trim().replace(/^["'`]|["'`]$/g, "",)
          );
        }
      } else {
        let val: unknown = valStr.replace(/^["'`]|["'`]$/g, "",);
        if (val === "true") val = true;
        else if (val === "false") val = false;
        else if (!isNaN(Number(val,),) && val !== "") val = Number(val,);
        result[k] = val;
      }
    }
  }

  return result;
}

/**
 * @description Extracts and parses YAML frontmatter from markdown content.
 * @param markdown - Raw markdown string potentially containing frontmatter.
 * @returns Object with parsed frontmatter dictionary and clean markdown body.
 * @example
 * ```ts
 * import { parseFrontmatter } from "./frontmatter.ts";
 * const { frontmatter, body } = parseFrontmatter("---\ntitle: Home\n---\n# Hello");
 * ```
 */
export function parseFrontmatter(markdown: string,): ParsedFrontmatter {
  if (!markdown) {
    return { frontmatter: {}, body: "", };
  }

  // Check if markdown starts with frontmatter delimiter ---
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/,);
  if (!match) {
    return { frontmatter: {}, body: markdown, };
  }

  const frontmatterRaw = match[1] || "";
  const body = markdown.slice(match[0].length,);
  const frontmatter = parseYAML(frontmatterRaw,);

  return { frontmatter, body, };
}

````

---

## File: `packages/mdblog/src/plugin/core/io.ts`

````ts
import type { IO, } from "../types.ts";
import { del, get, set, } from "idb-keyval";

/**
 * @description Options for browser CacheStorage and IndexedDB IO configuration.
 */
export interface CacheIOOptions {
  /**
   * @description Name of CacheStorage cache bucket.
   * @default "md-wire-v1"
   */
  cacheName?: string;

  /**
   * @description Whether to enable IndexedDB persistence via idb-keyval.
   * @default true
   */
  useIndexedDB?: boolean;
}

/**
 * @description Creates an IO implementation backed by browser Cache Storage and IndexedDB (idb-keyval).
 * @param options - Cache bucket name and IndexedDB configuration options.
 * @returns IO instance implementing readText, cacheGet, cachePut, and cacheDelete.
 * @example
 * ```ts
 * import { createBrowserIO } from "./io.ts";
 * const io = createBrowserIO({ cacheName: "docs-v1", useIndexedDB: true });
 * ```
 */
export function createBrowserIO(options: CacheIOOptions = {},): IO {
  const cacheName = options.cacheName ?? "md-wire-v1";
  const useIdb = options.useIndexedDB !== false &&
    typeof indexedDB !== "undefined";

  return {
    async readText(url: string,): Promise<string> {
      // The request's own query/hash never survives: `_md_raw=1` is always
      // appended fresh below, which is what tells the Service Worker to hand
      // over the markdown source instead of an intercepted rendering.
      const cleanPath = url.replace(/[?#].*$/, "",);
      // An origin-rooted path is meant relative to the application itself:
      // the `./` spelling is the one that also resolves under a deployment
      // subfolder (see toBaseRelativePath).
      const target = cleanPath.startsWith("/",) ? `.${cleanPath}` : cleanPath;

      let response: Response | null = null;
      try {
        response = await fetch(`${target}?_md_raw=1`,);
      } catch {
        // Only a rewritten spelling deserves a second chance at the original one
        if (target !== cleanPath) {
          try {
            response = await fetch(`${cleanPath}?_md_raw=1`,);
          } catch {
            // Both spellings failed: fall through to the cached copy below
          }
        }
      }

      if (response && response.ok) {
        const text = await response.text();
        if (useIdb) {
          set(`raw:${cleanPath}`, text,).catch(() => {},);
        }
        return text;
      }

      // Offline or gone: the raw text cached by a previous visit is next
      if (useIdb) {
        try {
          const cached = await get<string>(`raw:${cleanPath}`,);
          if (cached) return cached;
        } catch {
          // ignore
        }
      }

      throw new Error(`Failed to load markdown: document not found (${url})`,);
    },

    async cacheGet(key: string,): Promise<string | null> {
      // 1. First check IndexedDB via idb-keyval if available
      if (useIdb) {
        try {
          const val = await get<string>(key,);
          if (val) return val;
        } catch {
          // Fallback to Cache Storage
        }
      }

      // 2. Check Cache Storage
      if (typeof caches !== "undefined") {
        try {
          const cache = await caches.open(cacheName,);
          const req = new Request(
            `https://md-wire.local/${encodeURIComponent(key,)}`,
          );
          const match = await cache.match(req,);
          if (match) {
            return await match.text();
          }
        } catch {
          // Ignore cache storage errors
        }
      }

      return null;
    },

    async cachePut(key: string, val: string,): Promise<void> {
      // 1. Store in IndexedDB via idb-keyval
      if (useIdb) {
        try {
          await set(key, val,);
        } catch {
          // Non-fatal
        }
      }

      // 2. Store in Cache Storage
      if (typeof caches !== "undefined") {
        try {
          const cache = await caches.open(cacheName,);
          const req = new Request(
            `https://md-wire.local/${encodeURIComponent(key,)}`,
          );
          const res = new Response(val, {
            headers: { "Content-Type": "application/json", },
          },);
          await cache.put(req, res,);
        } catch {
          // Non-fatal
        }
      }
    },

    async cacheDelete(key: string,): Promise<void> {
      if (useIdb) {
        try {
          await del(key,);
        } catch {
          // Non-fatal
        }
      }
      if (typeof caches !== "undefined") {
        try {
          const cache = await caches.open(cacheName,);
          const req = new Request(
            `https://md-wire.local/${encodeURIComponent(key,)}`,
          );
          await cache.delete(req,);
        } catch {
          // Non-fatal
        }
      }
    },
  };
}

/**
 * @description Creates an in-memory IO implementation for testing or headless execution.
 * @param initialFiles - Map of initial relative file paths to their string contents.
 * @returns IO instance with in-memory files and cache maps.
 * @example
 * ```ts
 * import { createMemoryIO } from "./io.ts";
 * const io = createMemoryIO({ "/articles/index.md": "# Welcome" });
 * const text = await io.readText("/articles/index.md");
 * ```
 */
export function createMemoryIO(initialFiles: Record<string, string> = {},): IO {
  const files = new Map<string, string>(Object.entries(initialFiles,),);
  const cache = new Map<string, string>();

  return {
    async readText(url: string,): Promise<string> {
      const cleanUrl = url.replace(/[?#].*$/, "",);
      const content = files.get(cleanUrl,) ?? files.get(url,);
      if (content !== undefined) {
        return content;
      }
      throw new Error(`File not found: ${url}`,);
    },

    async cacheGet(key: string,): Promise<string | null> {
      return cache.get(key,) ?? null;
    },

    async cachePut(key: string, val: string,): Promise<void> {
      cache.set(key, val,);
    },

    async cacheDelete(key: string,): Promise<void> {
      cache.delete(key,);
    },
  };
}

````

---

## File: `packages/mdblog/src/plugin/core/parse.ts`

````ts
import { fromMarkdown, } from "mdast-util-from-markdown";
import { gfmFromMarkdown, } from "mdast-util-gfm";
import { gfm, } from "micromark-extension-gfm";
import type { MdastRoot, } from "../wire.ts";

/**
 * @description Parses a raw Markdown string into an mdast Root AST.
 * Fully supports CommonMark + GitHub Flavored Markdown (GFM)
 * (tables, task lists, strikethrough, autolinks).
 * @param markdown - Raw markdown string to parse into mdast tree.
 * @returns mdast Root AST representing the parsed document.
 * @example
 * ```ts
 * import { parseMarkdown } from "./parse.ts";
 * const root = parseMarkdown("# Hello World\n\n- [x] Done");
 * ```
 */
export function parseMarkdown(markdown: string,): MdastRoot {
  return fromMarkdown(markdown, {
    extensions: [gfm(),],
    mdastExtensions: [gfmFromMarkdown(),],
  },) as unknown as MdastRoot;
}

````

---

## File: `packages/mdblog/src/plugin/core/pipeline.ts`

````ts
import type { DocConfig, IO, } from "../types.ts";
import type { WireDoc, } from "../wire.ts";
import { parseMarkdown, } from "./parse.ts";
import { mdastToWire, } from "./to-wire.ts";
import { parseFrontmatter, } from "./frontmatter.ts";

/**
 * @description Pure transformation pipeline: parses markdown and returns a complete WireDoc AST.
 * Extracts frontmatter and heading title, returning a fully serializable WireDoc.
 * @param markdown - Raw markdown string to process.
 * @param url - Relative or absolute path identifier of the document.
 * @returns Complete WireDoc object with wire AST, title, raw text, and timestamp.
 * @example
 * ```ts
 * import { processMarkdown } from "./pipeline.ts";
 * const doc = processMarkdown("# My Post\n\nContent", "/articles/post.md");
 * ```
 */
export function processMarkdown(
  markdown: string,
  url: string,
): WireDoc {
  const { frontmatter, body, } = parseFrontmatter(markdown,);
  const root = parseMarkdown(body,);
  const { wire, title: astTitle, } = mdastToWire(root,);

  // Use frontmatter.title if defined, fallback to AST heading title
  const finalTitle =
    (typeof frontmatter.title === "string" && frontmatter.title.trim())
      ? frontmatter.title.trim()
      : astTitle;

  return {
    wire,
    title: finalTitle,
    raw: markdown,
    url,
    renderedAt: Date.now(),
    frontmatter,
  };
}

/**
 * @description Orchestrates document loading with TTL caching and IO abstraction.
 * Tries cache first, then reads raw text via IO and parses to WireDoc.
 * @param url - Document path or URL to load.
 * @param io - IO abstraction instance providing readText and cache operations.
 * @param config - Optional configuration for cache TTL and options.
 * @returns Resolves to the loaded and parsed WireDoc.
 * @example
 * ```ts
 * import { loadDoc } from "./pipeline.ts";
 * import { createMemoryIO } from "./io.ts";
 * const io = createMemoryIO({ "/doc.md": "# Title" });
 * const doc = await loadDoc("/doc.md", io);
 * ```
 */
export async function loadDoc(
  url: string,
  io: IO,
  config: DocConfig = {},
): Promise<WireDoc> {
  const ttlMs = (config.cacheTTLSeconds ?? 60) * 1000;
  const cacheKey = `wire:${url}`;

  // 1. Try cache
  try {
    const cachedJson = await io.cacheGet(cacheKey,);
    if (cachedJson) {
      const cachedDoc: WireDoc = JSON.parse(cachedJson,);
      const isFresh = Date.now() - cachedDoc.renderedAt < ttlMs;
      if (isFresh) {
        return cachedDoc;
      }
    }
  } catch (err) {
    console.warn(`[pipeline] Cache lookup warning for ${url}:`, err,);
  }

  // 2. Fetch raw markdown
  const markdown = await io.readText(url,);

  // 3. Process into WireDoc
  const doc = processMarkdown(markdown, url,);

  // 4. Update cache
  try {
    await io.cachePut(cacheKey, JSON.stringify(doc,),);
  } catch (err) {
    console.warn(`[pipeline] Cache write warning for ${url}:`, err,);
  }

  return doc;
}

````

---

## File: `packages/mdblog/src/plugin/core/shell.ts`

````ts
import type { WireDoc, } from "../wire.ts";

/**
 * Escapes characters that could terminate or corrupt a script tag.
 */
function safeJsonSerialize(data: unknown,): string {
  return JSON.stringify(data,).replace(/</g, "\\u003c",);
}

/**
 * @description Generates the full HTML shell for first-paint navigation.
 * Emits BeerCSS, manifest, and an inline `<script id="__md_wire">` payload for zero-latency initial rendering.
 *
 * This is the fallback document, used when the application's own `index.html`
 * cannot be reached — offline, or on a host that does not serve it. The
 * Service Worker prefers {@linkcode injectWireShell} over that real file so a
 * deployed page always carries the head the application was shipped with.
 * Keep both in lockstep: the same BeerCSS release, the same title suffix.
 * @param doc - Parsed WireDoc document to embed into the shell.
 * @param bundlePath - Relative path to the application bundle script.
 * @returns Fully formatted HTML document string.
 * @example
 * ```ts
 * import { defaultShell } from "./shell.ts";
 * import { processMarkdown } from "./pipeline.ts";
 * const doc = processMarkdown("# Welcome", "/index.md");
 * const html = defaultShell(doc, "./mdblog.js");
 * ```
 */
export function defaultShell(
  doc: WireDoc,
  bundlePath = "./mdblog.js",
): string {
  const serializedWire = safeJsonSerialize(doc,);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(doc.title,)} - mdBlog</title>
    <meta name="description" content="Documentation powered by Service Worker, Wire Format and Preact Islands" />
    <meta name="theme-color" content="#6750a4" />

    <!-- Web App Manifest -->
    <link rel="manifest" href="./manifest.json" />

    <!-- Favicon SVG Inline -->
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📑</text></svg>" />


    <!-- BeerCSS Framework v3.7.12 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.css" />
    <!-- The icon font ships inside beer.min.css as @font-face with font-display:
        block; preloading it starts the woff2 fetch in parallel with the
        stylesheet so the glyphs do not stay invisible behind the CSS round
        trip. Kept in lockstep with the application's own index.html. -->
    <link rel="preload" href="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/material-symbols-outlined.woff2" as="font" type="font/woff2" crossorigin />
    <script type="module" src="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.js"></script>

    <!-- Material Dynamic Colors -->
    <script type="module" src="https://cdn.jsdelivr.net/npm/material-dynamic-colors@1.1.2/dist/cdn/material-dynamic-colors.min.js"></script>

    <!-- Pre-rendered Wire Format JSON -->
    <script id="__md_wire" type="application/json">${serializedWire}</script>
  </head>
  <body class="auto">
    <div id="app"></div>
    <script type="module" src="${bundlePath}"></script>
  </body>
</html>`;
}

/**
 * @description Splices a pre-rendered wire payload into an existing HTML document.
 *
 * The first paint of a navigation is the one moment the reader waits for the
 * network; the payload removes the round trip, but hand copying the head into a
 * second document is how the two drift apart — a shell loading another framework
 * version, or missing the script that recovers a broken cache, is a shell that
 * hangs on a blank page. So the payload is injected into the document the
 * application actually ships, and only that document decides what a first paint
 * needs.
 *
 * The payload goes last in `<head>`, before the stylesheets are requested or the
 * bundle is loaded, and any payload the template already carries is replaced
 * rather than duplicated. The title follows the document.
 * @param html - The application document to embed the payload into.
 * @param doc - Parsed WireDoc document to render on first paint.
 * @returns The same document with the payload and the title updated.
 * @example
 * ```ts
 * import { injectWireShell } from "./shell.ts";
 * const html = injectWireShell(await Deno.readTextFile("./index.html"), doc);
 * ```
 */
export function injectWireShell(html: string, doc: WireDoc,): string {
  const payload = `<script id="__md_wire" type="application/json">${
    safeJsonSerialize(doc,)
  }</script>`;

  // A template that already carries a placeholder keeps its position: two
  // payloads would leave the reader parsing the stale one first.
  if (html.includes('id="__md_wire"',) || html.includes("id='__md_wire'",)) {
    return replaceTitle(
      html.replace(
        /<script[^>]*id=["']__md_wire["'][^>]*>[\s\S]*?<\/script>/i,
        payload,
      ),
      doc,
    );
  }

  const closingHead = /<\/head>/i;
  if (closingHead.test(html,)) {
    return replaceTitle(
      html.replace(closingHead, `  ${payload}\n</head>`,),
      doc,
    );
  }

  const openingBody = /<body[^>]*>/i;
  if (openingBody.test(html,)) {
    return replaceTitle(html.replace(openingBody, `${payload}$&`,), doc,);
  }

  return replaceTitle(`${payload}\n${html}`, doc,);
}

/**
 * Rewrites a single `<title>` element, leaving a document without one alone.
 */
function replaceTitle(html: string, doc: WireDoc,): string {
  return html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(doc.title,)} - mdBlog</title>`,
  );
}

function escapeHtml(str: string,): string {
  return str
    .replace(/&/g, "&amp;",)
    .replace(/</g, "&lt;",)
    .replace(/>/g, "&gt;",)
    .replace(/"/g, "&quot;",)
    .replace(/'/g, "&#39;",);
}

````

---

## File: `packages/mdblog/src/plugin/core/to-wire.ts`

````ts
import type { Root, RootContent, } from "npm:@types/mdast@4.0.4";
import type {
  MdastRoot,
  Wire,
  WireComponent,
  WireElement,
  WireFragment,
  WireIsland,
} from "../wire.ts";
import { sanitizeProps, } from "../wire.ts";
import { slugify, } from "../detect.ts";

/**
 * Extracts plain text from mdast nodes recursively.
 */
function extractText(node: unknown,): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  if (typeof n.value === "string") return n.value;
  if (Array.isArray(n.children,)) {
    return n.children.map(extractText,).join("",);
  }
  return "";
}

/**
 * @description Transforms an mdast Root into a pure JSON-serializable WireFragment tree.
 * Extracts the first top-level heading as document title.
 * @param root - mdast Root AST node generated by markdown parser.
 * @returns Object containing the root WireFragment and the extracted document title.
 * @example
 * ```ts
 * import { parseMarkdown } from "./parse.ts";
 * import { mdastToWire } from "./to-wire.ts";
 * const root = parseMarkdown("# Title\n\nBody content");
 * const { wire, title } = mdastToWire(root);
 * ```
 */
export function mdastToWire(
  root: MdastRoot,
): { wire: WireFragment; title: string } {
  let extractedTitle = "";

  function transform(node: RootContent | Root,): Wire | null {
    if (!node || typeof node !== "object") return null;

    switch (node.type) {
      case "root": {
        const children: Wire[] = [];
        for (const child of node.children) {
          const w = transform(child,);
          if (w !== null) children.push(w,);
        }
        return { t: "f", c: children, } as WireFragment;
      }

      case "heading": {
        const text = extractText(node,);
        if (node.depth === 1 && !extractedTitle) {
          extractedTitle = text.trim();
        }
        const id = slugify(text,);
        const children = transformChildren(node.children,);
        return {
          t: "c",
          n: "Heading",
          p: sanitizeProps({ depth: node.depth, id, },),
          c: children,
        } as WireComponent;
      }

      case "paragraph": {
        // Dynamic per-file island support in the markdown: ::FileName.js{start: 5} or ::FileName.js
        const text = extractText(node,).trim();
        const islandDirectiveMatch = text.match(
          /^:{2,3}\s*([A-Za-z0-9_.-]+)\s*(?:\{([\s\S]*)\})?\s*(?::{2,3})?$/,
        );
        if (islandDirectiveMatch && islandDirectiveMatch[1]) {
          const rawTarget = islandDirectiveMatch[1];
          const islandFileName = rawTarget.endsWith(".js",)
            ? rawTarget
            : `${rawTarget}.js`;
          let props: Record<string, unknown> = {};
          if (islandDirectiveMatch[2]) {
            const raw = islandDirectiveMatch[2].trim();
            const wrapped = raw.startsWith("{",) ? raw : `{${raw}}`;
            try {
              props = JSON.parse(wrapped,);
            } catch {
              try {
                // Quote unquoted object keys (e.g. start: 20 -> "start": 20) and normalize single quotes
                const quoted = wrapped
                  .replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":',)
                  .replace(/'([^']*)'/g, '"$1"',);
                props = JSON.parse(quoted,);
              } catch {
                // Ignore parse error, use empty props
              }
            }
          }
          return {
            t: "i",
            n: islandFileName,
            p: sanitizeProps(props,),
            c: [],
          } as WireIsland;
        }

        const children = transformChildren(node.children,);
        return {
          t: "c",
          n: "Paragraph",
          p: {},
          c: children,
        } as WireComponent;
      }

      case "blockquote": {
        return {
          t: "c",
          n: "Blockquote",
          p: {},
          c: transformChildren(node.children,),
        } as WireComponent;
      }

      case "list": {
        return {
          t: "c",
          n: "List",
          p: sanitizeProps({
            ordered: Boolean(node.ordered,),
            start: node.start ?? 1,
          },),
          c: transformChildren(node.children,),
        } as WireComponent;
      }

      case "listItem": {
        return {
          t: "c",
          n: "ListItem",
          p: sanitizeProps({
            checked: typeof node.checked === "boolean"
              ? node.checked
              : undefined,
          },),
          c: transformChildren(node.children,),
        } as WireComponent;
      }

      case "code": {
        // Support code blocks as Islands:
        // ```island:Counter
        // {"start": 10}
        // ```
        const lang = node.lang?.trim() ?? "";
        if (lang.startsWith("island:",)) {
          const rawIsland = lang.slice(7,).trim();
          const islandFileName = rawIsland.endsWith(".js",)
            ? rawIsland
            : `${rawIsland}.js`;
          let props: Record<string, unknown> = {};
          if (node.value.trim()) {
            try {
              props = JSON.parse(node.value.trim(),);
            } catch {
              props = { raw: node.value, };
            }
          }
          return {
            t: "i",
            n: islandFileName,
            p: sanitizeProps(props,),
            c: [],
          } as WireIsland;
        }

        return {
          t: "c",
          n: "CodeBlock",
          p: sanitizeProps({
            lang: node.lang ?? "",
            meta: node.meta ?? "",
            value: node.value ?? "",
          },),
        } as WireComponent;
      }

      case "inlineCode": {
        return {
          t: "c",
          n: "InlineCode",
          p: sanitizeProps({ value: node.value ?? "", },),
        } as WireComponent;
      }

      case "link": {
        return {
          t: "c",
          n: "Link",
          p: sanitizeProps({
            href: node.url,
            title: node.title ?? undefined,
          },),
          c: transformChildren(node.children,),
        } as WireComponent;
      }

      case "image": {
        return {
          t: "c",
          n: "Image",
          p: sanitizeProps({
            src: node.url,
            alt: node.alt ?? "",
            title: node.title ?? undefined,
          },),
        } as WireComponent;
      }

      case "strong": {
        return {
          t: "e",
          n: "strong",
          c: transformChildren(node.children,),
        } as WireElement;
      }

      case "emphasis": {
        return {
          t: "e",
          n: "em",
          c: transformChildren(node.children,),
        } as WireElement;
      }

      case "delete": {
        return {
          t: "e",
          n: "del",
          c: transformChildren(node.children,),
        } as WireElement;
      }

      case "break": {
        return {
          t: "e",
          n: "br",
        } as WireElement;
      }

      case "thematicBreak": {
        return {
          t: "e",
          n: "hr",
        } as WireElement;
      }

      case "table": {
        // GFM alignment lives on the "table" node, one value per column, and only
        // the cells know which column they fall into: this is where the two meet.
        // The header is positional too (first row), because mdast does not mark
        // its cells any other way.
        const align = node.align ?? [];
        const wireRows: WireComponent[] = node.children.map((
          row,
          rowIndex,
        ): WireComponent => ({
          t: "c",
          n: "TableRow",
          c: row.children.map((cell, colIndex,): WireComponent => ({
            t: "c",
            n: "TableCell",
            p: sanitizeProps({
              header: rowIndex === 0,
              align: align[colIndex] ?? undefined,
            },),
            c: transformChildren(cell.children,),
          })),
        }));
        const [headRow, ...bodyRows] = wireRows;

        // thead/tbody are not decorative: BeerCSS's rules for alternating rows
        // (table.stripes > tbody > tr:nth-child(odd)) and for the header border
        // (thead > tr > th) require this structure, and Preact, creating nodes
        // through the API, does not invent the implicit tbody an HTML parser
        // would.
        const sections: WireElement[] = [];
        if (headRow) {
          sections.push({ t: "e", n: "thead", c: [headRow,], },);
        }
        if (bodyRows.length > 0) {
          sections.push({ t: "e", n: "tbody", c: bodyRows, },);
        }

        return {
          t: "c",
          n: "Table",
          c: sections,
        } as WireComponent;
      }

      case "tableRow": {
        return {
          t: "c",
          n: "TableRow",
          c: transformChildren(node.children,),
        } as WireComponent;
      }

      case "tableCell": {
        return {
          t: "c",
          n: "TableCell",
          c: transformChildren(node.children,),
        } as WireComponent;
      }

      case "text": {
        return node.value;
      }

      case "html": {
        // STRICT SAFETY: Raw HTML is discarded immediately
        return null;
      }

      default: {
        return null;
      }
    }
  }

  function transformChildren(children?: unknown[],): Wire[] {
    if (!Array.isArray(children,)) return [];
    const result: Wire[] = [];
    for (const child of children) {
      const w = transform(child as RootContent,);
      if (w !== null) {
        result.push(w,);
      }
    }
    return result;
  }

  const wire = (transform(root as any,) as WireFragment) ?? { t: "f", c: [], };

  return { wire, title: extractedTitle || "Documentation", };
}

````

---

## File: `packages/mdblog/src/plugin/detect.ts`

````ts
/**
 * Path detection, URL normalization, and environment utilities.
 */

/**
 * @description Checks whether the current window is actively controlled by a Service Worker.
 * @returns True if `navigator.serviceWorker.controller` exists.
 * @example
 * ```ts
 * import { isSWControlling } from "./detect.ts";
 * if (isSWControlling()) {
 *   console.log("Managed by Service Worker");
 * }
 * ```
 */
export function isSWControlling(): boolean {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }
  return Boolean(navigator.serviceWorker.controller,);
}

/**
 * @description Computes canonical directory base URL respecting subfolders (e.g. GitHub Pages).
 * @returns Normalized base URL ending with a slash.
 * @example
 * ```ts
 * import { getAppBaseUrl } from "./detect.ts";
 * const base = getAppBaseUrl();
 * ```
 */
export function getAppBaseUrl(): string {
  if (typeof globalThis === "undefined" || !globalThis.location) return "./";
  const { origin, pathname, } = globalThis.location;
  if (!origin || origin === "null") return "./";
  if (pathname.endsWith(".html",)) {
    const dir = pathname.substring(0, pathname.lastIndexOf("/",) + 1,);
    return `${origin}${dir}`;
  }
  const dir = pathname.endsWith("/",) ? pathname : `${pathname}/`;
  return `${origin}${dir}`;
}

/**
 * @description Normalizes and resolves a documentation request path.
 * Maps clean paths like "/docs/guide" or "docs/guide" or "/docs/guide.md" to canonical ".md" paths.
 * Supports subfolder hosting on GitHub Pages (e.g. "/mdBlog/articles/guide.md").
 * @param urlOrPath - Raw request pathname or link URL.
 * @param basePath - Root articles folder relative path.
 * @returns Object with normalized docPath and boolean isDoc flag.
 * @example
 * ```ts
 * import { resolveDocPath } from "./detect.ts";
 * const { docPath, isDoc } = resolveDocPath("/articles/intro");
 * // docPath === "/articles/intro.md"
 * ```
 */
export function resolveDocPath(
  urlOrPath: string,
  basePath: string = "./articles",
): { docPath: string; isDoc: boolean } {
  let pathname = (urlOrPath || "").trim();
  if (pathname.includes("#",)) {
    pathname = pathname.substring(pathname.indexOf("#",) + 1,);
  }
  pathname = pathname.replace(/\?.*$/, "",);

  const cleanBase = basePath.replace(/^\.?\//, "",).replace(/\/$/, "",);

  // If path is root or empty
  if (
    pathname === "" || pathname === "/" || pathname === "./" ||
    pathname === `/${cleanBase}` || pathname === `${cleanBase}`
  ) {
    return { docPath: `/${cleanBase}/index.md`, isDoc: true, };
  }

  // Check if it pertains to articles, docs, or ends with .md
  const isDoc = pathname.includes(`/${cleanBase}/`,) ||
    pathname.startsWith(`${cleanBase}/`,) ||
    pathname.startsWith(`./${cleanBase}/`,) ||
    pathname.endsWith(`/${cleanBase}`,) ||
    pathname.endsWith(`/${cleanBase}/`,) ||
    pathname.includes("/docs/",) ||
    pathname.startsWith("docs/",) ||
    pathname.endsWith(".md",);

  if (!isDoc) {
    return { docPath: pathname, isDoc: false, };
  }

  let docPath = pathname;
  if (!docPath.endsWith(".md",)) {
    if (
      docPath.endsWith(`/${cleanBase}`,) || docPath.endsWith(`/${cleanBase}/`,)
    ) {
      docPath = `${docPath.replace(/\/+$/, "",)}/index.md`;
    } else {
      docPath = `${docPath}.md`;
    }
  }

  if (
    !docPath.includes(`/${cleanBase}`,) &&
    !docPath.startsWith(`${cleanBase}`,) &&
    !docPath.includes("/docs/",)
  ) {
    docPath = `/${cleanBase}/${docPath.replace(/^\.?\//, "",)}`;
  }

  if (!docPath.startsWith("/",) && !docPath.startsWith("./",)) {
    docPath = `/${docPath}`;
  }

  // Normalize duplicate slashes
  docPath = docPath.replace(/\/+/g, "/",);

  return { docPath, isDoc: true, };
}

/**
 * @description Rewrites a document path relative to the directory the application
 * is served from, instead of relative to the server's root.
 *
 * A Service Worker receives the request the browser already resolved: the page
 * asks for `./articles/index.md` and the worker is handed
 * `/mdBlog/articles/index.md`. Handing that origin-rooted spelling back to a
 * reader that resolves paths against the application's own directory puts the
 * deployment folder in front of it twice, so a site published under a subfolder
 * misses every document it holds while the very same code served at the root of
 * a domain cannot notice the difference. Reducing the path to what it is below
 * the application's directory settles both spellings into one, and keeps the
 * cache key of a document independent of where the site happens to be published.
 * @param docPath - Path as requested: origin-rooted, `./`-relative or bare.
 * @param baseDir - Directory holding the application, e.g. `"/mdBlog/"` or `"/"`.
 * @returns The same document addressed from baseDir, without a leading slash.
 * @example
 * ```ts
 * import { toBaseRelativePath } from "./detect.ts";
 * toBaseRelativePath("/mdBlog/articles/index.md", "/mdBlog/"); // "articles/index.md"
 * toBaseRelativePath("/articles/guide.md", "/"); // "articles/guide.md"
 * ```
 */
export function toBaseRelativePath(
  docPath: string,
  baseDir: string,
): string {
  if (!docPath) return "";
  const base = baseDir.startsWith("/",) ? baseDir : `/${baseDir}`;
  const prefix = base.endsWith("/",) ? base : `${base}/`;
  // The request came with the deployment folder spelled out in front of it.
  if (docPath.startsWith(prefix,)) return docPath.slice(prefix.length,);
  // Already relative to the application, in one of the two ways it is written.
  if (docPath.startsWith("./",)) return docPath.slice(2,);
  return docPath.replace(/^\//, "",);
}

/**
 * @description Generates a clean URL slug for heading anchors.
 * @param text - Plain heading text.
 * @returns Clean kebab-case slug string.
 * @example
 * ```ts
 * import { slugify } from "./detect.ts";
 * const slug = slugify("Configuration Section!");
 * // slug === "configuration-section"
 * ```
 */
export function slugify(text: string,): string {
  return text
    .toLowerCase()
    .normalize("NFD",)
    .replace(/[\u0300-\u036f]/g, "",)
    .replace(/[^\w\s-]/g, "",)
    .trim()
    .replace(/\s+/g, "-",);
}

````

---

## File: `packages/mdblog/src/plugin/mod.ts`

```ts
export * from "./wire.ts";
export * from "./types.ts";
export * from "./detect.ts";
export * from "./core/parse.ts";
export * from "./core/to-wire.ts";
export * from "./core/pipeline.ts";
export * from "./core/shell.ts";
export * from "./core/io.ts";
export * from "./adapters/sw.ts";
export * from "./adapters/client.ts";

```

---

## File: `packages/mdblog/src/plugin/types.ts`

```ts
import type { WireDoc, WireFragment, } from "./wire.ts";

/**
 * @description Pure I/O abstraction interface for document loading and caching.
 * All side effects (network, cache storage, IndexedDB) are injected through this interface,
 * keeping the core pipeline deterministic and environment-agnostic.
 */
export interface IO {
  /**
   * @description Reads plain text content from a specified URL or path.
   * @param url - Relative or absolute path to the target markdown resource.
   * @returns Resolves to the raw text content of the resource.
   */
  readText(url: string,): Promise<string>;

  /**
   * @description Retrieves a cached JSON string by key.
   * @param key - Unique cache key identifier.
   * @returns Resolves to the cached string payload, or null if not found.
   */
  cacheGet(key: string,): Promise<string | null>;

  /**
   * @description Persists a string payload into the cache.
   * @param key - Unique cache key identifier.
   * @param val - Serialized JSON string payload to persist.
   * @returns Resolves when write operation finishes.
   */
  cachePut(key: string, val: string,): Promise<void>;

  /**
   * @description Optional method to remove a cached item by key.
   * @param key - Unique cache key identifier to evict.
   * @returns Resolves when eviction completes.
   */
  cacheDelete?(key: string,): Promise<void>;
}

/**
 * @description Configuration options for markdown document resolution and caching.
 */
export interface DocConfig {
  /**
   * @description Base filesystem/URL directory path containing markdown articles.
   * @default "./articles"
   */
  basePath?: string;

  /**
   * @description Cache Time-To-Live in seconds for parsed WireDoc AST instances.
   * @default 60
   */
  cacheTTLSeconds?: number;

  /**
   * @description Set of registered island names allowed for dynamic execution.
   */
  islands?: Set<string>;

  /**
   * @description Name of the CacheStorage bucket used for offline storage.
   * @default "md-wire-v1"
   */
  cacheName?: string;
}

export type { WireDoc, WireFragment, };

```

---

## File: `packages/mdblog/src/plugin/wire.ts`

````ts
/**
 * Wire Format types and serialization utilities.
 * Pure TypeScript definitions, 100% JSON-serializable.
 */

/**
 * @description Root mdast Abstract Syntax Tree node produced by markdown parsing.
 */
export interface MdastRoot {
  /** @description Node type discriminator ("root"). */
  type: string;
  /** @description List of child AST nodes. */
  children: unknown[];
  /** @description Optional position metadata or custom node properties. */
  [key: string]: unknown;
}

/**
 * @description Union type of all valid nodes and primitives in the Wire Format AST tree.
 */
export type Wire =
  | string
  | number
  | boolean
  | null
  | Wire[]
  | WireElement
  | WireComponent
  | WireIsland
  | WireFragment;

/**
 * @description Intrinsic HTML element representation (e.g. strong, em, del, br, hr).
 */
export interface WireElement {
  /** @description Discriminator tag for intrinsic HTML elements. */
  t: "e";
  /** @description Tag name ("strong", "em", "del", "br", "hr"). */
  n: string;
  /** @description Safe attributes dictionary. */
  p?: Record<string, unknown>;
  /** @description Nested child wire nodes. */
  c?: Wire[];
}

/**
 * @description Named static component resolved by client component registry (e.g. Heading, Paragraph, CodeBlock).
 */
export interface WireComponent {
  /** @description Discriminator tag for components. */
  t: "c";
  /** @description Component name registered in defaultRegistry. */
  n: string;
  /** @description Serializable component props. */
  p?: Record<string, unknown>;
  /** @description Nested child wire nodes. */
  c?: Wire[];
}

/**
 * @description Interactive Island hydrated on demand on the client via HTML+ES modules.
 */
export interface WireIsland {
  /** @description Discriminator tag for islands. */
  t: "i";
  /** @description Island filename or component name (e.g. "Counter.js"). */
  n: string;
  /** @description Serialized props passed to the island component. */
  p?: Record<string, unknown>;
  /** @description Fallback child wire nodes rendered before hydration. */
  c?: Wire[];
}

/**
 * @description Fragment grouping children without creating a wrapper container in the DOM.
 */
export interface WireFragment {
  /** @description Discriminator tag for fragments. */
  t: "f";
  /** @description Nested child wire nodes. */
  c?: Wire[];
}

/**
 * @description Complete document representation returned by the wire pipeline.
 */
export interface WireDoc {
  /** @description Root WireFragment containing all child elements and components. */
  wire: WireFragment;
  /** @description Extracted document title (from frontmatter or first heading). */
  title: string;
  /** @description Original raw markdown string content. */
  raw: string;
  /** @description Resolved URL or path of the document. */
  url: string;
  /** @description Epoch timestamp in milliseconds when the document was parsed. */
  renderedAt: number;
  /** @description Parsed YAML frontmatter key-value pairs. */
  frontmatter?: Record<string, any>;
}

/**
 * @description Sanitizes props to guarantee 100% JSON serializability.
 * Strips circular references, functions, and symbols.
 * @param p - Raw props dictionary to sanitize.
 * @returns Clean, JSON-serializable properties object.
 * @example
 * ```ts
 * import { sanitizeProps } from "./wire.ts";
 * const safe = sanitizeProps({ count: 10, fn: () => {} });
 * // safe is { count: 10 }
 * ```
 */
export function sanitizeProps(
  p?: Record<string, unknown>,
): Record<string, unknown> {
  if (!p || typeof p !== "object") return {};
  try {
    return JSON.parse(JSON.stringify(p,),);
  } catch {
    return {};
  }
}

/**
 * @description Counts total nodes in a Wire tree.
 * @param wire - Root or branch Wire node to inspect.
 * @returns Total count of nodes in the subtree.
 * @example
 * ```ts
 * import { countWireNodes } from "./wire.ts";
 * const total = countWireNodes({ t: "f", c: ["hello", "world"] });
 * ```
 */
export function countWireNodes(wire: Wire,): number {
  if (!wire || typeof wire !== "object") return 1;
  if (Array.isArray(wire,)) {
    let sum = 1;
    for (const item of wire) {
      sum += countWireNodes(item,);
    }
    return sum;
  }
  let count = 1;
  if ("c" in wire && Array.isArray(wire.c,)) {
    for (const child of wire.c) {
      count += countWireNodes(child,);
    }
  }
  return count;
}

/**
 * @description Counts interactive islands in a Wire tree.
 * @param wire - Root or branch Wire node to inspect.
 * @returns Total count of island nodes (`t: "i"`).
 * @example
 * ```ts
 * import { countWireIslands } from "./wire.ts";
 * const islands = countWireIslands({ t: "i", n: "Counter.js", p: {} });
 * ```
 */
export function countWireIslands(wire: Wire,): number {
  if (!wire || typeof wire !== "object") return 0;
  if (Array.isArray(wire,)) {
    let sum = 0;
    for (const item of wire) {
      sum += countWireIslands(item,);
    }
    return sum;
  }
  let count = wire.t === "i" ? 1 : 0;
  if ("c" in wire && Array.isArray(wire.c,)) {
    for (const child of wire.c) {
      count += countWireIslands(child,);
    }
  }
  return count;
}

````

---

## File: `packages/mdblog/src/register-sw.ts`

````ts
import { isSWActive, } from "./state.ts";
import { getAppBaseUrl, } from "./plugin/detect.ts";
import { APP_VERSION, } from "./version.ts";

/**
 * @description Registers the mdBlog offline Service Worker with dynamic subfolder scope resolution.
 * Updates the global `isSWActive` signal upon successful activation.
 * @returns Resolves when registration attempt finishes.
 * @example
 * ```ts
 * import { registerServiceWorker } from "./register-sw.ts";
 * await registerServiceWorker();
 * ```
 */
export async function registerServiceWorker(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    console.info("[SW] Service Worker is not supported in this browser.",);
    isSWActive.value = false;
    return;
  }

  try {
    // Derives the base path and scope dynamically for subfolder compatibility (e.g. GitHub Pages)
    const baseUrl = getAppBaseUrl();
    // The build stamp travels in the script URL, and that is the whole point of
    // it: a worker is only replaced when the bytes of its script change, and
    // sw.js is copied verbatim from public/ — so a deploy that rebuilds the
    // bundle alone would leave the previous worker in charge of every visit,
    // answering navigations with the shell and the engine of a build nobody has
    // any more. A different URL is a different worker: the install runs, the
    // assets are re-cached, and the superseded build's caches go with it.
    const swUrl = APP_VERSION
      ? `${baseUrl}sw.js?version=${encodeURIComponent(APP_VERSION,)}`
      : `${baseUrl}sw.js`;

    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: baseUrl,
      type: "module",
      // The update check must reach the network: served from the browser's own
      // cache, a worker whose script changed bytes under a frozen version URL
      // (every `noversion` dev build) would never be noticed, and the stale
      // engine would keep answering every navigation. This is the one knob
      // that makes the byte comparison in the comment above actually run.
      updateViaCache: "none",
    },);

    // Check for updates immediately so stale workers are replaced
    registration.update().catch(() => { },);

    if (navigator.serviceWorker.controller) {
      isSWActive.value = true;
    }

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      isSWActive.value = true;
    },);

    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING", },);
    }

    if (registration.installing) {
      registration.installing.addEventListener("statechange", (e,) => {
        const sw = e.target as ServiceWorker;
        if (sw.state === "activated") {
          isSWActive.value = true;
        }
      },);
    }
  } catch (err) {
    // It may simply be an environment without Service Worker support (isolated
    // preview), but a "script evaluation failed" is a bundle bug: sw.js imports
    // the same file as the app and a worker has no `document`. Treating that up
    // front as normal would hide the real failure, so the warning stays neutral.
    console.warn("[SW] Registration failed:", err,);
    isSWActive.value = false;
  }
}

````

---

## File: `packages/mdblog/src/render/from-wire.ts`

````ts
import {
  type ComponentChildren,
  type ComponentType,
  Fragment,
  h,
  type VNode,
} from "preact";
import type {
  Wire,
  WireComponent,
  WireElement,
  WireFragment,
  WireIsland,
} from "../plugin/wire.ts";
import { defaultRegistry, } from "./registry.ts";
import { dynamicIslandsCache, } from "./hydrate-islands.ts";

/**
 * @description Map of component names to component implementations.
 */
export type ComponentRegistry = Record<string, unknown>;

/**
 * @description Options for rendering Wire AST to Preact VNodes.
 */
export interface WireToVNodeOptions {
  /** @description Custom component registry override. */
  registry?: ComponentRegistry;
  /** @description Island component registry map. */
  islands?: Record<string, unknown>;
}

/**
 * @description Transforms a Wire node tree into Preact VNodes without dangerouslySetInnerHTML.
 * Ensures complete XSS safety and maps elements and components to Preact virtual DOM.
 * @param wire - Wire AST node, array of nodes, or primitive.
 * @param options - Optional custom components and islands registries.
 * @returns Preact VNode, children, or primitive renderable by Preact.
 * @example
 * ```ts
 * import { wireToVNode } from "./from-wire.ts";
 * const vnode = wireToVNode({ t: "c", n: "Paragraph", c: ["Hello"] });
 * ```
 */
export function wireToVNode(
  wire: Wire,
  options: WireToVNodeOptions = {},
): unknown {
  const registry: Record<string, any> = {
    ...defaultRegistry,
    ...options.registry,
  };
  const islandRegistry: Record<string, any> = options.islands ?? {};

  if (wire === null || wire === undefined) {
    return null;
  }

  // Primitive types
  if (
    typeof wire === "string" || typeof wire === "number" ||
    typeof wire === "boolean"
  ) {
    return wire;
  }

  // Array of nodes
  if (Array.isArray(wire,)) {
    return wire.map((item, index,) =>
      h(Fragment, { key: index, }, wireToVNode(item, options,) as any,)
    );
  }

  // Object node
  const node = wire as WireElement | WireComponent | WireIsland | WireFragment;

  switch (node.t) {
    case "f": {
      const children = (node.c ?? []).map((child, idx,) =>
        h(Fragment, { key: idx, }, wireToVNode(child, options,) as any,)
      );
      return h(Fragment, null, children,);
    }

    case "e": {
      const children = (node.c ?? []).map((child, idx,) =>
        h(Fragment, { key: idx, }, wireToVNode(child, options,) as any,)
      );
      return h(node.n, (node.p ?? {}) as Record<string, unknown>, children,);
    }

    case "c": {
      const Comp = (registry[node.n] ?? registry.Unknown) as ComponentType<
        Record<string, unknown>
      >;
      const children = (node.c ?? []).map((child, idx,) =>
        h(Fragment, { key: idx, }, wireToVNode(child, options,) as any,)
      );
      const props = { ...(node.p ?? {}), nodeType: node.n, };
      return h(Comp, props, children,);
    }

    case "i": {
      // Dynamic Island Node (HTML+ES)
      const islandFileName = node.n.endsWith(".js",) ? node.n : `${node.n}.js`;
      const baseName = islandFileName.replace(/\.js$/, "",);
      const Comp = islandRegistry[node.n] ||
        islandRegistry[islandFileName] ||
        islandRegistry[baseName] ||
        dynamicIslandsCache[node.n] ||
        dynamicIslandsCache[islandFileName] ||
        dynamicIslandsCache[baseName];
      const propsJson = JSON.stringify(node.p ?? {},);
      // Only an explicit registry (SSG / pre-render) takes ownership of the
      // container. On normal navigation the slot is left empty for
      // `hydrateIslands`: mounting through both paths puts two Preact roots on
      // the same element and duplicates the widget as soon as the module is cached.
      const externallyOwned = options.islands !== undefined;
      const eagerlyMounted = externallyOwned && Boolean(Comp,);
      const isMissing = externallyOwned && !Comp;

      // Children inside container for initial render / fallback
      let innerContent: ComponentChildren = null;
      if (eagerlyMounted) {
        try {
          innerContent = h(
            Comp as any,
            (node.p ?? {}) as Record<string, unknown>,
          );
        } catch (err) {
          console.warn(
            `[from-wire] Initial render error for island ${node.n}:`,
            err,
          );
        }
      }

      if (!innerContent && node.c && node.c.length > 0) {
        innerContent = (node.c ?? []).map((child, idx,) =>
          h(Fragment, { key: idx, }, wireToVNode(child, options,) as any,)
        );
      }

      return h("div", {
        "data-island": node.n,
        "data-props": propsJson,
        // The main tree took over the container (SSG/pre-render): selective
        // hydration must always skip these nodes.
        "data-island-prerendered": eagerlyMounted ? "true" : undefined,
        "data-island-missing": isMissing ? "true" : undefined,
        children: innerContent,
      },);
    }

    default: {
      return null;
    }
  }
}

````

---

## File: `packages/mdblog/src/render/hydrate-islands.ts`

````ts
import { type ComponentType, h, render, } from "preact";

/**
 * @description Options for island selective hydration.
 */
export interface HydrateOptions {
  /** @description Root DOM container element to scan for islands. Defaults to document.body. */
  root?: HTMLElement;
}

/**
 * @description In-memory registry cache of dynamically imported island components.
 */
export const dynamicIslandsCache: Record<string, unknown> = {};

/**
 * @description One import promise per island file, shared between concurrent
 * hydration passes. Failed attempts are evicted (see {@link hydrateNode}), so a
 * later navigation can retry; exported for tests and diagnostics.
 */
export const inFlightImports: Record<
  string,
  Promise<Record<string, unknown> | null>
> = {};

/**
 * @description Containers claimed by a hydration pass that is still running. A node is claimed before the first `await` so a second, overlapping pass cannot mount the same island a second time.
 */
const claimedNodes = new WeakSet<Element>();

/** @description Scan currently in flight, used to serialize concurrent hydration calls. */
let activePass: Promise<number> | null = null;

/** @description Roots requested by calls that arrived while a pass was already running. */
const pendingRoots = new Set<HTMLElement>();

if (typeof globalThis !== "undefined") {
  (globalThis as Record<string, unknown>).__mdblog_islands =
    dynamicIslandsCache;
}

function mountIsland(
  comp: ComponentType<any>,
  props: Record<string, unknown>,
  el: HTMLElement,
) {
  // Unmounts a previous root of this container, if any. Without this, a second
  // mount would find the old vnode still attached to nodes already removed from
  // the DOM and produce an extra copy of the widget in the same slot.
  render(null, el,);
  el.innerHTML = "";
  render(h(comp, props as any,), el,);
}

/**
 * @description Reads and parses the current `data-props` of an island container.
 * @param el - The island placeholder element.
 * @returns Parsed props, or an empty object when the payload is invalid.
 */
function readIslandProps(el: HTMLElement,): Record<string, unknown> {
  try {
    return JSON.parse(el.dataset.props || "{}",);
  } catch (_) {
    // Ignores the parsing error
    return {};
  }
}

/**
 * @description Stamps a container as mounted by this function, together with the exact props rendered.
 */
function markMounted(el: HTMLElement,): void {
  el.dataset.islandHydrated = "true";
  el.dataset.islandMountedProps = el.dataset.props ?? "{}";
  delete el.dataset.islandMissing;
}

/**
 * @description Mounts a single `[data-island]` container, importing its HTML+ES module on demand.
 * @param el - The island placeholder element.
 * @returns Resolves to `true` when the island was mounted (or already mounted by the main tree).
 */
async function hydrateNode(el: HTMLElement,): Promise<boolean> {
  const name = el.dataset.island;
  if (!name) return false;

  const islandFileName = name.endsWith(".js",) ? name : `${name}.js`;
  const baseName = islandFileName.replace(/\.js$/, "",);

  // 1. Check the in-memory cache first
  const cachedComp = dynamicIslandsCache[name] ||
    dynamicIslandsCache[islandFileName] ||
    dynamicIslandsCache[baseName];

  if (cachedComp) {
    try {
      mountIsland(cachedComp as ComponentType<any>, readIslandProps(el,), el,);
      markMounted(el,);
      return true;
    } catch (err) {
      console.error(
        `[hydrate] Failed to hydrate cached island "${name}":`,
        err,
      );
      el.dataset.islandError = "true";
      return false;
    }
  }

  // 2. Main path: native dynamic import from ./islands/
  try {
    if (!inFlightImports[islandFileName]) {
      const islandUrl = globalThis.location
        ? new URL(`./islands/${islandFileName}`, globalThis.location.href,).href
        : `./islands/${islandFileName}`;

      const dynamicImport = new Function("path", "return import(path)",);
      const attempt = dynamicImport(islandUrl,).catch(() =>
        dynamicImport(`./islands/${islandFileName}`,)
      );
      // Neither spelling resolved: drop the memo so a later navigation can
      // retry instead of awaiting a permanently rejected promise. The stored
      // attempt itself stays rejected — this caller still reports the failure.
      attempt.catch(() => {
        delete inFlightImports[islandFileName];
      },);
      inFlightImports[islandFileName] = attempt;
    }

    const mod = await inFlightImports[islandFileName];

    const firstKey = mod ? Object.keys(mod,)[0] : undefined;
    const dynamicComp = (mod
      ? (mod[baseName] || mod.default || (firstKey ? mod[firstKey] : null))
      : null) as ComponentType<any> | null;

    if (dynamicComp) {
      dynamicIslandsCache[name] = dynamicComp;
      dynamicIslandsCache[islandFileName] = dynamicComp;
      dynamicIslandsCache[baseName] = dynamicComp;

      // Re-read the props: they may have changed while the import was in flight
      mountIsland(dynamicComp, readIslandProps(el,), el,);
      markMounted(el,);
      return true;
    }

    el.dataset.islandMissing = "true";
    return false;
  } catch (err) {
    console.warn(
      `[hydrate] Failed to load island ./islands/${islandFileName}:`,
      err,
    );
    el.dataset.islandError = "true";
    return false;
  }
}

async function scanIslands(root: HTMLElement,): Promise<number> {
  const nodes = root.querySelectorAll<HTMLElement>("[data-island]",);
  let hydratedCount = 0;

  for (const el of nodes) {
    // Container pre-rendered by the main tree: that tree owns its props.
    if (el.dataset.islandPrerendered === "true") continue;

    const props = el.dataset.props ?? "{}";
    const mounted = el.dataset.islandMountedProps;

    // Already mounted by this function with the same props: nothing to do. When
    // the props change (SPA navigation reuses the same DOM element) the island is
    // remounted, otherwise it would keep showing the previous document's instance.
    if (mounted !== undefined && mounted === props) continue;

    // A concurrent pass claimed this node and is still inside an `await`
    if (claimedNodes.has(el,)) continue;

    claimedNodes.add(el,);
    const didMount = await hydrateNode(el,);
    // The claim lasts only while an `await` is pending: the `data-island-*`
    // marks become the durable signal of "already mounted with these props",
    // which lets the island remount when the document changes its props.
    claimedNodes.delete(el,);
    if (didMount) hydratedCount++;
  }

  return hydratedCount;
}

/**
 * @description Scans the DOM for dynamic `[data-island]` markers and hydrates them on-demand. Loads HTML+ES modules dynamically from `./islands/${islandFileName}` with zero bundler dependency. Concurrent calls are serialized: the island tree is mounted exactly once per container even when several entry points (router timeout, view effects, manual API) trigger hydration during the same render.
 * @param opts - Configuration options specifying root DOM node.
 * @returns Resolves to the count of newly hydrated island components.
 * @example
 * ```ts
 * import { hydrateIslands } from "./render/hydrate-islands.ts";
 * const hydrated = await hydrateIslands();
 * console.log(`Hydrated ${hydrated} islands.`);
 * ```
 */
export async function hydrateIslands(
  opts: HydrateOptions = {},
): Promise<number> {
  if (typeof document === "undefined") {
    return 0;
  }

  const root = opts.root ?? document.body;

  if (activePass) {
    pendingRoots.add(root,);
    return activePass;
  }

  const pass = (async () => {
    let total = await scanIslands(root,);
    // Calls that arrived during the scan ask for an extra pass: that is what
    // captures placeholders created by a re-render after the `await`.
    while (pendingRoots.size > 0) {
      const queued = [...pendingRoots,];
      pendingRoots.clear();
      for (const nextRoot of queued) {
        total += await scanIslands(nextRoot,);
      }
    }
    return total;
  })();

  activePass = pass;
  try {
    return await pass;
  } finally {
    if (activePass === pass) activePass = null;
  }
}

````

---

## File: `packages/mdblog/src/render/registry.ts`

```ts
import {
  type ComponentChildren,
  type ComponentType,
  h,
  type VNode,
} from "preact";
import { html, } from "htm/preact";
import { useSignal, } from "@preact/signals";
import { isWideScreen, } from "../state.ts";

export interface HeadingProps {
  depth?: number | string;
  id?: string;
  children?: ComponentChildren;
}

export function Heading(
  { depth = 1, id, children, }: HeadingProps = {},
): VNode {
  const headingTags = ["h4", "h5", "h6", "h6", "h6", "h6",];
  const clampedDepth = Math.min(Math.max(Number(depth,) || 1, 1,), 6,);
  const tag = headingTags[clampedDepth - 1] ?? "h6";
  // BeerCSS sets the heading scale one level above what a phone can carry (an
  // `h4` is 2rem, 32px, and wraps a short title over three lines), but it also
  // ships a `.small` variant for every level: h4 1.5rem, h5 1.25rem, h6 1rem.
  // Narrow screens therefore take the small variant of their own level instead
  // of only the two deepest ones, which keeps the ladder even — 28px for the
  // document title, 24 for a section, 20 for a sub-section, 16 below that —
  // rather than a huge title over titles smaller than the body text.
  const isSmall = clampedDepth >= 4 || !isWideScreen.value;

  const anchor = id
    ? html`
      <a
        href="#${id}"
        class="secondary-text link small-text medium-opacity left-margin small-margin"
        title="Direct link to this section"
        aria-label="Direct link"
        onClick=${(e: Event,) => {
          // Keeps the anchor hash from driving the article router
          e.preventDefault();
          if (typeof document !== "undefined") {
            document.getElementById(id,)?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            },);
          }
        }}
      >
        <i>link</i>
      </a>
    `
    : null;

  // Every margin class of an element reads one and the same custom property, so
  // a heading can only be spaced symmetrically: .large-margin sets the value both
  // .top-margin and .bottom-margin read. Adjacent block margins then collapse,
  // which is what keeps the rhythm at 1.5rem instead of 3rem.
  return h(
    tag as any,
    {
      id,
      class: `wrap bold top-margin bottom-margin large-margin ${
        isSmall ? "small" : ""
      }`.trim(),
    },
    children,
    anchor,
  ) as VNode;
}

export interface ParagraphProps {
  children?: ComponentChildren;
}

export function Paragraph({ children, }: ParagraphProps = {},): VNode {
  return html`<p class="bottom-margin large-margin wrap">${children}</p>`;
}

export interface CodeBlockProps {
  lang?: string;
  value?: string;
}

export function CodeBlock({ lang, value = "", }: CodeBlockProps = {},): VNode {
  const copied = useSignal(false,);

  async function handleCopy(): Promise<void> {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(value,);
        copied.value = true;
        setTimeout(() => {
          copied.value = false;
        }, 2000,);
      }
    } catch {
      // Ignore copy error
    }
  }

  return html`
    <article class="no-padding surface-container-highest border round margin">
      <!-- The card's head: language chip on the left, copy button on the right.
          BeerCSS has no justify-between, so a .max spacer does the pushing. The
          strip is padded with the two directional classes rather than a size
          class: a size class would pad it on all four sides and open a gap
          between the strip and the rounded edge of the card it sits in. -->
      <div
        class="row left-padding right-padding small-padding surface-container">
        <span class="chip small primary-container bold">
          ${lang || "text"}
        </span>
        <div class="max"></div>
        <button
          class="circle small transparent"
          onClick=${handleCopy}
          title="Copy code"
          aria-label="Copy code"
        >
          <i>${copied.value ? "check" : "content_copy"}</i>
        </button>
      </div>
      <!-- The <pre> keeps its own 1rem of padding: it is what holds the code off
          the card's border, so the wrapper adds none of its own. -->
      <div class="scroll">
        <pre class="no-margin"><code class="small-text">${value}</code></pre>
      </div>
    </article>
  `;
}

export interface InlineCodeProps {
  value?: string;
}

export function InlineCode({ value = "", }: InlineCodeProps = {},): VNode {
  return html`<code class="surface-container-high round">${value}</code>`;
}

export interface BlockquoteProps {
  children?: ComponentChildren;
}

export function Blockquote({ children, }: BlockquoteProps = {},): VNode {
  // BeerCSS already styles the element: blockquote{padding:1rem;
  // border-inline-start:.25rem solid var(--primary)} — the left accent is part of
  // the tag, which is why no "left-border"/"border-primary" class is added here
  // (neither exists). Only the card outline, the corner radius and the outer
  // spacing come from the classes.
  return html`
    <blockquote class="border round margin wrap">
      ${children}
    </blockquote>
  `;
}

export interface ListProps {
  ordered?: boolean;
  start?: number;
  children?: ComponentChildren;
}

export function List({ ordered, start, children, }: ListProps = {},): VNode {
  if (ordered) {
    return html`
      <ol
        start=${start}
        class="left-padding bottom-margin large-margin wrap"
      >${children}</ol>
    `;
  }
  return html`
    <ul class="left-padding bottom-margin large-margin wrap">${children}</ul>
  `;
}

export interface ListItemProps {
  checked?: boolean;
  children?: ComponentChildren;
}

export function ListItem({ checked, children, }: ListItemProps = {},): VNode {
  if (typeof checked === "boolean") {
    return html`
      <li class="row wrap bottom-margin">
        <label class="checkbox">
          <input type="checkbox" checked=${checked} disabled />
          <span></span>
        </label>
        <div class="max wrap">${children}</div>
      </li>
    `;
  }
  return html`<li class="bottom-margin wrap">${children}</li>`;
}

export interface TableProps {
  children?: ComponentChildren;
}

export function Table({ children, }: TableProps = {},): VNode {
  // "stripes" paints --active (a gray at 19% opacity, declared once in :root
  // and identical in both themes) on the odd rows of the tbody: that is the
  // requested even/odd banding. "border" adds the hairline between the body
  // rows; the one under the header, BeerCSS already applies through its own
  // thead>tr>th rule. Both need the thead/tbody structure that "to-wire.ts"
  // emits. No "round" on the table: with no background or box of its own its
  // radius would not paint anyway (and :is(...,table,...):not(.round) zeroes
  // it), while the rounded corners one does see come from BeerCSS's
  // "border-radius:inherit" on the wrapper div, whose overflow clips the
  // header band down to 0.75rem, the <article>'s own radius.
  return html`
    <div class="responsive scroll vertical-margin large-margin">
      <table class="border stripes">${children}</table>
    </div>
  `;
}

export interface TableRowProps {
  children?: ComponentChildren;
}

export function TableRow({ children, }: TableRowProps = {},): VNode {
  return html`<tr>${children}</tr>`;
}

export interface TableCellProps {
  align?: string;
  /** @description Marks the first row cells as column headers (<th>). */
  header?: boolean;
  children?: ComponentChildren;
}

/** @description BeerCSS alignment classes for the GFM per-column alignment. */
const CELL_ALIGN_CLASS: Record<string, string> = {
  left: "left-align",
  center: "center-align",
  right: "right-align",
};

export function TableCell({
  align,
  header,
  children,
}: TableCellProps = {},): VNode {
  const cellClass = [
    // The header gets primary-container rather than a surface tone: the body
    // bands are translucent gray, and an opaque gray would vanish among them.
    header ? "primary-container" : "",
    align ? CELL_ALIGN_CLASS[align] ?? "" : "",
  ].filter(Boolean,).join(" ",);

  if (header) {
    return html`<th class=${cellClass} scope="col">${children}</th>`;
  }
  return html`<td class=${cellClass || undefined}>${children}</td>`;
}

export interface LinkProps {
  href?: string;
  title?: string;
  children?: ComponentChildren;
}

export function Link({ href = "", title, children, }: LinkProps = {},): VNode {
  let targetHref = href;
  const isExternal = href.startsWith("http://",) ||
    href.startsWith("https://",) || href.startsWith("//",);

  if (!isExternal) {
    if (href.endsWith(".md",) || href.includes(".md#",)) {
      const cleanHref = href.startsWith("./",) ? href.slice(2,) : href;
      const fullPath = cleanHref.startsWith("/",)
        ? cleanHref
        : `/docs/${cleanHref}`;
      targetHref = `#${fullPath}`;
    }
  }

  return html`
    <a
      href=${targetHref}
      title=${title}
      class="link primary-text bold wrap"
      target=${isExternal ? "_blank" : undefined}
      rel=${isExternal ? "noopener noreferrer" : undefined}
    >
      ${children}
    </a>
  `;
}

export interface ImageProps {
  src?: string;
  alt?: string;
  title?: string;
}

export function Image({ src, alt, title, }: ImageProps = {},): VNode {
  return html`
    <!-- no-margin is not decoration: it cancels the user-agent figure margin
        (one em vertically, 40px inline), which would otherwise inset the image
        far more than the prose. The space around the figure then comes from the
        paragraphs before and after it, exactly as it does for every other block. -->
    <figure class="no-margin">
      <img src=${src} alt=${alt ||
        ""} title=${title} class="responsive round border" loading="lazy" />
      ${alt
        ? html`
          <figcaption
            class="small-text secondary-text center-align top-margin tiny-margin">
            ${alt}
          </figcaption>
        `
        : null}
    </figure>
  `;
}

export interface UnknownProps {
  nodeType?: string;
}

export function Unknown({ nodeType, }: UnknownProps = {},): VNode {
  return html`
    <span class="chip error-container small" title=${`Unknown node type: ${nodeType}`}>
      [${nodeType ?? "Unknown"}]
    </span>
  `;
}

/**
 * @description Default map of standard Markdown and GFM components used by mdBlog.
 */
export const defaultRegistry: Record<string, unknown> = {
  Heading,
  Paragraph,
  CodeBlock,
  InlineCode,
  Blockquote,
  List,
  ListItem,
  Table,
  TableRow,
  TableCell,
  Link,
  Image,
  Unknown,
};

```

---

## File: `packages/mdblog/src/router.ts`

````ts
import {
  articles,
  currentDoc,
  currentPath,
  errorMessage,
  isLoading,
  loadArticles,
  parseTimeMs,
  viewMode,
} from "./state.ts";
import { mdFetch, } from "./plugin/adapters/client.ts";
import { createBrowserIO, } from "./plugin/core/io.ts";
import { hydrateIslands, } from "./render/hydrate-islands.ts";
import { normalizePath, } from "./utils.ts";
import { APP_VERSION, } from "./version.ts";

/**
 * @description Cache bucket the client reads and writes its wire documents into.
 *
 * It follows the build stamp on purpose, mirroring the naming of the Service
 * Worker itself (`mdblog-pwa-${version}` in `sw.js`): when page and worker come
 * from the same build they share one bucket, and a new release orphans the old
 * name, which the worker's activate step then deletes. A frozen name (the
 * former `mdblog-pwa-v1`) accumulated entries no cleanup ever owned.
 */
export const CLIENT_CACHE_NAME = `mdblog-pwa-${APP_VERSION || "dev"}`;

const io = createBrowserIO({
  cacheName: CLIENT_CACHE_NAME,
  useIndexedDB: true,
},);

const config = {
  basePath: "./articles",
  cacheTTLSeconds: 60,
};

/**
 * Sequence token of the latest navigation. Every navigation takes a new number
 * and only the one still holding the token may commit state, so a slow response
 * for an old route can no longer land on top of a newer one.
 */
let navigationSeq = 0;

/**
 * The hash this module wrote itself. Normalizing a route into the address bar
 * fires a `hashchange` that would re-enter the handler for the route already
 * being loaded; remembering the value lets the listener recognise and drop its
 * own echo, while a genuine link click or a back/forward step never matches it.
 */
let selfTriggeredHash: string | null = null;

/**
 * @description How long a document request may stay unanswered before the
 * reader reports it as failed, in milliseconds.
 *
 * A request that never settles is indistinguishable from a slow one, and the
 * loading state has no way out of its own: without a budget the reader is left
 * watching a bar that will never finish instead of the card that explains the
 * failure and offers the way back to the start page. That is what happens when
 * a service worker loses its cache underneath an open tab.
 */
export const NAVIGATION_TIMEOUT_MS = 15_000;

/**
 * @description Settles a promise no later than a deadline, rejecting with a
 * descriptive error when the original one is still pending.
 * @param pending - The work to guard, typically a document request.
 * @param ms - How long to wait for it.
 * @param route - What was asked for, quoted in the rejection message.
 * @returns The result of the original promise, or a rejection.
 * @example
 * ```ts
 * import { withTimeout } from "./router.ts";
 * const doc = await withTimeout(mdFetch("./articles/guide.md", io), 500, "guide.md");
 * ```
 */
export function withTimeout<T,>(
  pending: Promise<T>,
  ms: number,
  route: string,
): Promise<T> {
  return new Promise<T>((resolve, reject,) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `${route} did not answer within ${
            Math.round(ms / 1000,)
          }s. The copy held by the browser may be damaged: reload the page, and if it keeps happening clear the site data.`,
        ),
      );
    }, ms,);
    // The original work is not cancelled — it is simply no longer waited for. A
    // late answer still lands, because committing state is guarded by the
    // navigation token rather than by this timer.
    pending.then(resolve, reject,).then(() => clearTimeout(timer,));
  },);
}

/**
 * @description Navigates to a target article markdown route, loading Wire AST and hydrating dynamic islands.
 * @param path - Relative or hash route (e.g. "#/articles/intro.md" or "intro.md").
 * @returns Resolves when document is loaded and state is updated.
 * @example
 * ```ts
 * import { navigateTo } from "./router.ts";
 * await navigateTo("overview.md");
 * ```
 */
export async function navigateTo(path: string,): Promise<void> {
  // Route cleaning itself is what normalizePath already does (hash, `./`,
  // articles/ and docs/ prefixes, empty/index spellings all collapse to the
  // filename); only the implicit `.md` suffix is added here.
  let clean = normalizePath(path,);
  if (!clean.endsWith(".md",)) {
    clean = `${clean}.md`;
  }

  const hashRoute = clean === "index.md" ? "#/" : `#/${clean}`;
  const fetchPath = `./articles/${clean}`;

  if (typeof globalThis !== "undefined" && globalThis.location) {
    if (globalThis.location.hash !== hashRoute) {
      selfTriggeredHash = hashRoute;
      globalThis.location.hash = hashRoute;
    }
  }

  const seq = ++navigationSeq;
  currentPath.value = hashRoute;
  viewMode.value = "preview";
  isLoading.value = true;
  errorMessage.value = null;

  try {
    const t0 = performance.now();
    const doc = await withTimeout(
      mdFetch(fetchPath, io, config,),
      NAVIGATION_TIMEOUT_MS,
      fetchPath,
    );
    if (seq !== navigationSeq) return; // superseded by a newer navigation

    const t1 = performance.now();
    parseTimeMs.value = Math.max(0.1, Number((t1 - t0).toFixed(1,),),);

    currentDoc.value = doc;
    document.title = `${doc.title} - mdBlog`;

    // Schedule selective island hydration
    setTimeout(() => {
      hydrateIslands();
    }, 50,);
  } catch (err) {
    if (seq !== navigationSeq) return;
    console.error(`[router] Error loading ${fetchPath}:`, err,);
    errorMessage.value = err instanceof Error ? err.message : String(err,);
  } finally {
    // Only the winning navigation owns the loading flag: a superseded request
    // must not clear it while a newer one is still in flight.
    if (seq === navigationSeq) isLoading.value = false;
  }
}

/**
 * @description Initializes hash-based routing, listens to hash changes, and handles pre-rendered wire payloads.
 * @example
 * ```ts
 * import { initRouter } from "./router.ts";
 * initRouter();
 * ```
 */
export function initRouter(): void {
  if (typeof window === "undefined") return;

  // Loads the blog's article list dynamically
  loadArticles().then(() => {
    // When no route was requested, go to the first article
    const hash = globalThis.location.hash;
    if (!hash && articles.value.length > 0 && articles.value[0]) {
      navigateTo(articles.value[0].path,);
    }
  },).catch(() => {},);

  function handleRoute() {
    const hash = globalThis.location.hash;

    if (selfTriggeredHash !== null) {
      const echo = selfTriggeredHash;
      selfTriggeredHash = null;
      // This event is the echo of our own normalization: the route is already
      // being loaded, so re-navigating would fetch and render it twice.
      if (hash === echo) return;
    }

    if (hash) {
      navigateTo(hash,);
    } else {
      navigateTo("index.md",);
    }
  }

  globalThis.addEventListener("hashchange", handleRoute,);

  // Check if first paint has pre-rendered wire in DOM
  const preRenderedScript = document.getElementById("__md_wire",);
  if (preRenderedScript && preRenderedScript.textContent) {
    try {
      const doc = JSON.parse(preRenderedScript.textContent,);
      currentDoc.value = doc;
      // The shell always stamps a url, but a hand written or truncated payload
      // may not: fall back to the home route instead of a filename, so the
      // sidebar highlights something that actually exists.
      currentPath.value = doc.url || "#/";
      document.title = `${doc.title} - mdBlog`;
      preRenderedScript.remove();
      setTimeout(() => {
        hydrateIslands();
      }, 50,);
      return;
    } catch (err) {
      console.warn("[router] Failed to parse inline __md_wire script:", err,);
    }
  }

  // Otherwise, perform initial fetch
  handleRoute();
}

````

---

## File: `packages/mdblog/src/state.ts`

````ts
import { computed, effect, type Signal, signal, } from "@preact/signals";
import type { WireDoc, } from "./plugin/wire.ts";
import {
  type ParsedFrontmatter,
  parseFrontmatter,
} from "./plugin/core/frontmatter.ts";
import { get, set, } from "idb-keyval";
import { getAppBaseUrl, } from "./plugin/detect.ts";
import { TOC_RAIL_HEIGHT_TIERS, } from "./utils.ts";

/**
 * @description View rendering mode: rendered preview, AST wire tree JSON, or raw markdown.
 */
export type ViewMode = "preview" | "ast" | "raw";

/**
 * @description Article node representation in the hierarchical articles tree.
 */
export interface ArticleItem {
  /** @description Relative filename (e.g. "intro.md"). */
  name: string;
  /** @description URL slug for navigation. */
  slug: string;
  /** @description Relative document path (e.g. "./articles/intro.md"). */
  path: string;
  /** @description Document display title. */
  title: string;
  /** @description Semantic Material Symbols icon name. */
  icon: string;
  /** @description Optional badge text. */
  badge?: string;
  /** @description Document publication or update date. */
  date?: string;
  /** @description Document route location hash. */
  location?: string;
  /** @description Author name. */
  author?: string;
  /** @description Short description or summary. */
  description?: string;
  /** @description List of tags or categories. */
  tags?: string[];
  /** @description Hierarchical depth (0 = root/index.md, 1 = top level, 2 = subpages). */
  depth: number;
  /** @description Path of the parent document. */
  parentPath?: string;
  /** @description Nested sub-pages. */
  children?: ArticleItem[];
}

/**
 * @description Search index item for client-side search.
 */
export interface SearchDocItem {
  /** @description Document path. */
  path: string;
  /** @description Document title. */
  title: string;
  /** @description Document description. */
  description: string;
  /** @description Plain text content extracted for indexing. */
  content: string;
  /** @description Document tags. */
  tags: string[];
  /** @description Document icon. */
  icon: string;
  /** @description Optional badge text. */
  badge?: string;
  /** @description Nesting depth. */
  depth: number;
}

/**
 * @description Reactive signal holding the flattened list of all articles in pre-order.
 */
export const articles: Signal<ArticleItem[]> = signal<ArticleItem[]>([],);

/**
 * @description Reactive signal holding the hierarchical article tree starting from index.md.
 */
export const articleTree: Signal<ArticleItem[]> = signal<ArticleItem[]>([],);

/**
 * @description Reactive signal indicating whether article discovery is in progress.
 */
export const isArticlesLoading: Signal<boolean> = signal<boolean>(false,);

/**
 * @description Reactive signal holding search index items for SearchBox.
 */
export const searchDocs: Signal<SearchDocItem[]> = signal<SearchDocItem[]>([],);

/**
 * @description Reactive signal holding current active article route hash.
 */
export const currentPath: Signal<string> = signal<string>(
  "./articles/index.md",
);

/**
 * @description Reactive signal holding currently loaded and parsed WireDoc document.
 */
export const currentDoc: Signal<WireDoc | null> = signal<WireDoc | null>(null,);

/**
 * @description Reactive signal indicating whether a document is currently being loaded.
 */
export const isLoading: Signal<boolean> = signal<boolean>(true,);

/**
 * @description Reactive signal holding current error message string, or null if healthy.
 */
export const errorMessage: Signal<string | null> = signal<string | null>(null,);

/**
 * @description Reactive signal indicating whether browser is offline.
 */
export const isOffline: Signal<boolean> = signal<boolean>(
  typeof navigator !== "undefined" ? !navigator.onLine : false,
);

/**
 * @description Reactive signal indicating whether Service Worker is actively controlling page.
 */
export const isSWActive: Signal<boolean> = signal<boolean>(false,);

/**
 * @description Minimum viewport width (CSS pixels) of the inline layout: from it on, the sidebar and the table of contents get columns that reserve their own space, and only below it do they open as modal panels. It matches BeerCSS's `l` breakpoint.
 */
export const WIDE_SCREEN_MIN_PX = 993;

/**
 * @description localStorage key holding the user's sidebar open/closed preference.
 */
const SIDEBAR_STORAGE_KEY = "mdblog-sidebar";

/**
 * Reads the persisted sidebar preference. The preference only applies to wide screens: on narrow ones the drawer is a transient modal and must always start closed.
 */
function readSidebarPreference(): boolean {
  if (
    typeof window !== "undefined" &&
    window.innerWidth < WIDE_SCREEN_MIN_PX
  ) return false;
  try {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY,);
      if (stored === "open") return true;
      if (stored === "closed") return false;
    }
  } catch {
    // Storage unavailable: falls back to the default derived from the width
  }
  return true;
}

/**
 * @description Reactive signal controlling sidebar drawer visibility on every breakpoint (persisted in localStorage).
 */
export const sidebarOpen: Signal<boolean> = signal<boolean>(
  readSidebarPreference(),
);

/**
 * @description Reactive signal tracking whether the viewport is wide (at least `WIDE_SCREEN_MIN_PX`), used to switch the sidebar and the summary between inline columns and modal panels.
 */
export const isWideScreen: Signal<boolean> = signal<boolean>(
  typeof window !== "undefined"
    ? window.innerWidth >= WIDE_SCREEN_MIN_PX
    : true,
);

/**
 * @description Viewport height in CSS pixels, kept current on resize. The table of contents rail takes its scrollable height from it, so the scrollbar shows up as soon as the entries no longer fit the screen however many of them there are.
 */
export const viewportHeight: Signal<number> = signal<number>(
  typeof window !== "undefined" ? window.innerHeight : 0,
);

/**
 * @description Reactive signal controlling the search dialog. The dialog is a modal at every breakpoint, which is why its state lives here instead of inside the component: the page behind it must stop scrolling.
 */
export const searchOpen: Signal<boolean> = signal<boolean>(false,);

/**
 * @description Query typed into the search dialog. It is global for one reason: the keyboard shortcuts are registered once at the module level, outside the component tree, and `Escape` has to both dismiss the panel and discard what was typed so the next opening starts clean.
 */
export const searchQuery: Signal<string> = signal<string>("",);

/**
 * @description Opens the search dialog. The only entry point a caller needs: nothing outside the component (icon button, focused field, `Ctrl/Cmd+K`) should have to remember to reset the query on the way in.
 */
export function openSearch(): void {
  searchOpen.value = true;
}

/**
 * @description Dismisses the search dialog and discards its query.
 */
export function closeSearch(): void {
  searchOpen.value = false;
  searchQuery.value = "";
}

/**
 * @description Document that asked for the narrow-screen summary panel, or null when nobody did. Keeping the *request* (a path) rather than a boolean is what makes the open state below purely derived: a new document invalidates the old request on its own, without any effect having to write it back to false.
 */
const tocPanelRequest: Signal<string | null> = signal<string | null>(null,);

/**
 * @description Whether the narrow-screen table of contents modal is on screen. Derived, never written: it holds only while the requesting document is still the one being read and the viewport is narrow, so navigating away or widening the window closes the panel by itself. On wide screens the summary is the inline `tocRailOpen` column instead.
 */
export const tocModalOpen: Signal<boolean> = computed(
  () =>
    tocPanelRequest.value !== null &&
    tocPanelRequest.value === currentPath.value &&
    !isWideScreen.value,
);

/**
 * @description Toggles the narrow-screen summary panel for the document currently on screen.
 */
export function toggleTocModal(): void {
  tocPanelRequest.value = tocModalOpen.value ? null : currentPath.value;
}

/**
 * @description Closes the narrow-screen summary panel, forgetting which document asked for it.
 */
export function closeTocModal(): void {
  tocPanelRequest.value = null;
}

/**
 * @description localStorage key holding the user's table of contents rail open/closed preference.
 */
const TOC_STORAGE_KEY = "mdblog-toc";

/**
 * Reads the persisted table of contents preference. Open by default: the rail only occupies a column on wide screens, so a stored "open" can never cover content on narrow ones.
 */
function readTocPreference(): boolean {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(TOC_STORAGE_KEY,) !== "closed";
    }
  } catch {
    // Storage unavailable: falls back to the open default
  }
  return true;
}

/**
 * @description Reactive signal controlling the inline table of contents rail column on wide screens (persisted in localStorage). On narrow screens the summary is a transient modal driven by local state instead.
 */
export const tocRailOpen: Signal<boolean> = signal<boolean>(
  readTocPreference(),
);

/**
 * @description Reactive signal tracking document parse time in milliseconds.
 */
export const parseTimeMs: Signal<number> = signal<number>(0,);

/**
 * @description Reactive signal controlling document view mode (preview, ast, raw).
 */
export const viewMode: Signal<ViewMode> = signal<ViewMode>("preview",);

/**
 * @description Keyword table behind {@link inferArticleIcon}: each row maps a set
 * of lowercase terms (Portuguese next to their English equivalents) to the
 * Material Symbols icon they select. Rows are matched in order, first hit wins.
 */
const ARTICLE_ICON_KEYWORDS: ReadonlyArray<readonly [string[], string,]> = [
  [["index", "home", "início", "start",], "home",],
  [["readme", "overview",], "article",],
  [["guia", "guide", "demo", "pratico",], "science",],
  [["html", "migracao", "migration", "code",], "code",],
  [["wire", "ast", "spec", "schema",], "schema",],
  [["island", "ilha",], "widgets",],
  [["fluxo", "flow", "ciclo", "vida",], "sync",],
  [["plano", "plan", "desenvolvimento", "roadmap",], "checklist",],
];

/**
 * Assigns a semantic icon based on the article name or title.
 */
function inferArticleIcon(slug: string, title: string,): string {
  // The keyword table keeps the Portuguese terms next to their English
  // equivalents: the engine is language agnostic, so an article tree written in
  // Portuguese has to get the same icons as one written in English. The slug is
  // part of what is matched here, which is why the shipped articles use English
  // slugs.
  const combined = `${slug} ${title}`.toLowerCase();
  for (const [keywords, icon,] of ARTICLE_ICON_KEYWORDS) {
    if (keywords.some((keyword,) => combined.includes(keyword,))) {
      return icon;
    }
  }
  return "description";
}

/**
 * Extracts the main heading (# Title) of a Markdown text in the browser.
 */
function extractTitleFromMarkdown(text: string, fallbackName: string,): string {
  const lines = text.split("\n",);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ",)) {
      return trimmed.replace(/^#\s+/, "",).trim();
    }
  }
  return fallbackName.replace(/\.md$/, "",);
}

/**
 * @description Removes markdown syntax and code blocks to produce clean plain text for search indexing.
 * @param markdownBody - Markdown string to strip.
 * @returns Cleaned plain text string.
 * @example
 * ```ts
 * import { cleanMarkdownText } from "./state.ts";
 * const plain = cleanMarkdownText("# Heading\n\n**bold** and [link](url)");
 * ```
 */
export function cleanMarkdownText(markdownBody: string,): string {
  if (!markdownBody) return "";
  return markdownBody
    .replace(/^#+\s+/gm, " ",)
    .replace(/```[\s\S]*?```/g, " ",)
    .replace(/`([^`]+)`/g, "$1",)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1",)
    .replace(/[*_~`#>-]/g, " ",)
    .replace(/\s+/g, " ",)
    .trim();
}

/**
 * @description Flattens a hierarchical article tree into a sequential list in pre-order.
 * @param items - Hierarchical list of ArticleItems.
 * @returns Flattened array of ArticleItems preserving depth and parentPath.
 * @example
 * ```ts
 * import { flattenArticles } from "./state.ts";
 * const flat = flattenArticles(articleTree.value);
 * ```
 */
export function flattenArticles(items: ArticleItem[],): ArticleItem[] {
  const flattened: ArticleItem[] = [];
  function traverse(node: ArticleItem,) {
    flattened.push(node,);
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        traverse(child,);
      }
    }
  }
  for (const item of items) {
    traverse(item,);
  }
  return flattened;
}

/**
 * @description One entry of a frontmatter `pages:`/`articles:`/`subpages:` list:
 * either a bare filename or an object carrying at least the `path` it points at.
 */
type SubPageRef = string | { path?: string };

/**
 * Fetches the raw markdown of a document under `articles/`, asking first with the
 * `?_md_raw=1` marker (the spelling that bypasses Service Worker interception)
 * and then plain, swallowing network failures so callers can fall back to the
 * empty string.
 */
async function fetchArticleText(normalized: string,): Promise<string> {
  const url = `${getAppBaseUrl()}articles/${normalized}`;
  try {
    const res = await fetch(`${url}?_md_raw=1`,);
    if (res.ok) return await res.text();
    const res2 = await fetch(url,);
    if (res2.ok) return await res2.text();
  } catch {
    // offline or network failure
  }
  return "";
}

/**
 * Builds an `ArticleItem` (and its search-index twin) out of an already parsed
 * document. Shared by every level of the tree, the root `index.md` included, so
 * frontmatter interpretation, title/icon fallbacks and search accumulation are
 * written exactly once. The caller keeps its own `ParsedFrontmatter` handle to
 * read the sub-page list from without paying for a second parse.
 */
function buildArticleItem(
  normalized: string,
  parsed: ParsedFrontmatter,
  depth: number,
  parentPath: string | undefined,
  searchAccumulator: SearchDocItem[],
): ArticleItem {
  const { frontmatter: pageFm, body: pageBody, } = parsed;
  const slug = normalized.replace(/\.md$/, "",);
  const title = pageFm.title ||
    (depth === 0
      ? "Home page"
      : extractTitleFromMarkdown(pageBody, normalized,));
  const icon = pageFm.icon || inferArticleIcon(slug, title,);
  const itemPath = `./articles/${normalized}`;
  const tags: string[] = Array.isArray(pageFm.tags,)
    ? pageFm.tags
    : (pageFm.tag ? [pageFm.tag,] : []);

  const item: ArticleItem = {
    name: normalized,
    slug,
    path: itemPath,
    title,
    icon,
    badge: pageFm.badge,
    date: pageFm.date,
    location: pageFm.location || `#/articles/${normalized}`,
    author: pageFm.author,
    description: pageFm.description,
    tags,
    depth,
    parentPath,
    children: [],
  };

  // Fills the search entry that later goes to IndexedDB
  searchAccumulator.push({
    path: itemPath,
    title,
    description: pageFm.description || "",
    content: cleanMarkdownText(pageBody,),
    tags,
    icon,
    badge: pageFm.badge,
    depth,
  },);

  return item;
}

/**
 * Loads a page and its sub-pages recursively, from each page's frontmatter.
 */
async function loadPageRecursive(
  rawItem: SubPageRef,
  depth: number,
  parentPath: string,
  visited: Set<string>,
  searchAccumulator: SearchDocItem[],
): Promise<ArticleItem | null> {
  const cleanName = typeof rawItem === "string"
    ? rawItem.trim()
    : (rawItem?.path || "").trim();
  const normalized = cleanName.replace(/^\.?\//, "",);
  if (!normalized || visited.has(normalized,)) return null;
  visited.add(normalized,);

  try {
    const pageText = await fetchArticleText(normalized,);
    const parsed = parseFrontmatter(pageText,);
    const item = buildArticleItem(
      normalized,
      parsed,
      depth,
      parentPath,
      searchAccumulator,
    );

    // Accepts 'pages', 'articles' or 'subpages' in the page's own frontmatter
    const subPagesRaw = parsed.frontmatter.pages ||
      parsed.frontmatter.articles || parsed.frontmatter.subpages;
    if (Array.isArray(subPagesRaw,) && subPagesRaw.length > 0) {
      const children: ArticleItem[] = [];
      for (const subItem of subPagesRaw) {
        const childNode = await loadPageRecursive(
          subItem,
          depth + 1,
          item.path,
          visited,
          searchAccumulator,
        );
        if (childNode) {
          children.push(childNode,);
        }
      }
      item.children = children;
    }

    return item;
  } catch (err) {
    console.warn(`[state] Failed to process page ${normalized}:`, err,);
    const slug = normalized.replace(/\.md$/, "",);
    return {
      name: normalized,
      slug,
      path: `./articles/${normalized}`,
      title: cleanName,
      icon: inferArticleIcon(slug, cleanName,),
      depth,
      parentPath,
      children: [],
    };
  }
}

/**
 * @description Fills `searchDocs` from the index previously persisted in IndexedDB, if there is one. Used as the offline path and as a safety net whenever discovery produces nothing searchable.
 * @returns Resolves once the store has been read (or failed to be read).
 * @example
 * ```ts
 * import { restoreSearchIndexFromCache } from "./state.ts";
 * await restoreSearchIndexFromCache();
 * ```
 */
export async function restoreSearchIndexFromCache(): Promise<void> {
  try {
    const cached = await get<SearchDocItem[]>("mdblog-search-index",);
    if (Array.isArray(cached,) && cached.length > 0) {
      searchDocs.value = cached;
    }
  } catch {
    // Storage unavailable: search simply has nothing to filter yet
  }
}

/**
 * @description Dynamically loads and discovers all articles starting from index.md frontmatter.

 * Recursively parses sub-page trees and updates both `articleTree` and `articles` signals.
 * @returns Resolves to the discovered flattened articles list.
 * @example
 * ```ts
 * import { loadArticles } from "./state.ts";
 * await loadArticles();
 * ```
 */
export async function loadArticles(): Promise<ArticleItem[]> {
  isArticlesLoading.value = true;

  try {
    // 1. Load index.md and parse its frontmatter
    const indexRaw = await fetchArticleText("index.md",);

    if (indexRaw) {
      const parsed = parseFrontmatter(indexRaw,);
      const pagesList: SubPageRef[] = parsed.frontmatter.pages ||
        parsed.frontmatter.articles || parsed.frontmatter.subpages || [];

      const visited = new Set<string>(["index.md",],);
      const searchAccumulator: SearchDocItem[] = [];

      // Home page, built from index.md itself (depth: 0) through the very same
      // construction every other document of the tree goes through
      const indexItem = buildArticleItem(
        "index.md",
        parsed,
        0,
        undefined,
        searchAccumulator,
      );

      // Recursively loads each child page declared in the frontmatter
      const childNodes: ArticleItem[] = [];
      if (Array.isArray(pagesList,)) {
        for (const item of pagesList) {
          const node = await loadPageRecursive(
            item,
            1,
            indexItem.path,
            visited,
            searchAccumulator,
          );
          if (node) {
            childNodes.push(node,);
          }
        }
      }
      indexItem.children = childNodes;

      const tree = [indexItem,];
      const flattened = flattenArticles(tree,);

      articleTree.value = tree;
      articles.value = flattened;
      searchDocs.value = searchAccumulator;

      // Persists the cache to IndexedDB through idb-keyval
      try {
        await set("browser-articles-cache", flattened,);
        await set("mdblog-search-index", searchAccumulator,);
      } catch {
        // non-fatal
      }

      return articles.value;
    }

    // 2. Offline fallback: read the cache stored in IndexedDB (idb-keyval)
    try {
      const cached = await get<ArticleItem[]>("browser-articles-cache",);
      if (cached && Array.isArray(cached,) && cached.length > 0) {
        articles.value = cached;
      }
      if (articles.value.length > 0) {
        return articles.value;
      }
    } catch {
      // ignored
    }

    return articles.value;
  } finally {
    isArticlesLoading.value = false;
    // Whatever the outcome — online discovery, offline cache, a failed listing —
    // an empty index is the one thing the search dialog cannot work with, so the
    // persisted copy is the last source tried. It belongs here rather than in a
    // mount effect of the component: the dialog is created on demand and may be
    // opened by a shortcut long before, or never, the panel is on screen.
    if (searchDocs.value.length === 0) await restoreSearchIndexFromCache();
  }
}

if (typeof window !== "undefined") {
  globalThis.addEventListener("online", () => {
    isOffline.value = false;
    loadArticles().catch(() => {},);
  },);
  globalThis.addEventListener("offline", () => {
    isOffline.value = true;
  },);

  // Keyboard shortcuts live next to the state they drive. `Ctrl/Cmd+K` opens the
  // dialog and `Escape` dismisses it together with its query, so the handler has
  // to reach a signal the component does not own any more; registering it here
  // also means the shortcut works whether or not the panel is mounted, which a
  // component effect could only guarantee while SearchBox happened to be on
  // screen.
  globalThis.addEventListener("keydown", (e: KeyboardEvent,) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearch();
    } else if (e.key === "Escape" && searchOpen.value) {
      closeSearch();
    }
  },);

  // Keeps the viewport-derived signals in step with the layout. `resize` alone
  // is not reliable: some viewport changes (browser zoom, an iframe reflow, a
  // mobile URL bar collapsing) reach it late or not at all, whereas a
  // media-query change always fires when a breakpoint is crossed. Watching the
  // very thresholds the UI acts on — the inline/overlay switch and the rail
  // height tiers — and then re-reading the live metrics is therefore both
  // cheaper and steadier than tracking every pixel of every resize.
  const syncViewport = (): void => {
    isWideScreen.value = window.innerWidth >= WIDE_SCREEN_MIN_PX;
    viewportHeight.value = window.innerHeight;
  };

  globalThis.addEventListener("resize", syncViewport,);

  if (typeof window.matchMedia === "function") {
    const watched = [
      `(min-width: ${WIDE_SCREEN_MIN_PX}px)`,
      ...TOC_RAIL_HEIGHT_TIERS.filter((tier,) => tier.minViewportPx > 0).map(
        (tier,) => `(min-height: ${tier.minViewportPx}px)`,
      ),
    ];
    for (const query of watched) {
      window.matchMedia(query,).addEventListener("change", syncViewport,);
    }
  }

  if (typeof document !== "undefined") {
    effect(() => {
      // Persists the table of contents column preference. It is stored at every
      // width: on narrow screens the panel uses its own state and never reads
      // this signal, so a stored "open" can never cover the content.
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(
            TOC_STORAGE_KEY,
            tocRailOpen.value ? "open" : "closed",
          );
        }
      } catch {
        // Persistence unavailable: stays in memory only
      }
    },);

    effect(() => {
      // Persists the sidebar open/closed preference, but only on wide screens:
      // on narrow ones the drawer is a transient modal and must not reappear
      // open on the next load.
      const wide = isWideScreen.value;
      try {
        if (typeof localStorage !== "undefined") {
          if (!wide) {
            localStorage.removeItem(SIDEBAR_STORAGE_KEY,);
          } else {
            localStorage.setItem(
              SIDEBAR_STORAGE_KEY,
              sidebarOpen.value ? "open" : "closed",
            );
          }
        }
      } catch {
        // Persistence unavailable: stays in memory only
      }
    },);

    effect(() => {
      // Locks the background scroll while a modal panel is on screen, so that
      // the wheel and the touch drag act on the opened panel alone. Only the
      // genuinely modal panels qualify: on wide screens the sidebar and the
      // summary are inline columns that reserve their own space, and the search
      // dialog is modal at every width. Each panel owns its own scroll area
      // (`.scroll` plus the full-height dialog), so nothing inside gets stuck.
      // The class goes on the root element as well: `overflow:hidden` on the
      // body only reaches the viewport through the browser's body-to-root
      // propagation rule, and pinning `html` makes the lock independent of it.
      const narrow = !isWideScreen.value;
      const modalShowing = searchOpen.value ||
        (narrow && (sidebarOpen.value || tocModalOpen.value));
      document.body.classList.toggle("no-scroll", modalShowing,);
      document.documentElement.classList.toggle("no-scroll", modalShowing,);
    },);

    effect(() => {
      // One transient panel at a time. Two stacked dialogs would double the
      // backdrop and fight over the scroll lock, so opening search dismisses
      // whatever narrow-screen panel is up. On wide screens the sidebar is a
      // permanent column, hence left alone.
      if (!searchOpen.value) return;
      closeTocModal();
      if (!isWideScreen.value) sidebarOpen.value = false;
    },);
  }
}

````

---

## File: `packages/mdblog/src/utils.ts`

````ts
import type { ArticleItem, } from "./state.ts";
import type { Wire, WireComponent, } from "./plugin/wire.ts";

/**
 * @description Normalizes any article route variant (hash, relative, docs/ or articles/ prefixed) into a plain markdown filename.
 * @param p - Raw route or path string (e.g. "#/articles/intro.md", "./docs/intro.md").
 * @returns Plain markdown filename (e.g. "intro.md"), defaulting to "index.md".
 * @example
 * ```ts
 * import { normalizePath } from "./utils.ts";
 * normalizePath("#/articles/intro.md"); // "intro.md"
 * normalizePath(""); // "index.md"
 * ```
 */
export function normalizePath(p?: string | null,): string {
  let s = (p || "")
    .replace(/^#\/?/, "",)
    .replace(/^\.?\//, "",)
    .replace(/^articles\//, "",)
    .replace(/^docs\//, "",);
  if (!s || s === "/" || s === "index") s = "index.md";
  return s;
}

/**
 * @description Builds the canonical hash route href for an article path.
 * @param path - Article path in any accepted variant.
 * @returns Hash route ("#/" for the home page, "#/name.md" otherwise).
 * @example
 * ```ts
 * import { articleHrefFromPath } from "./utils.ts";
 * articleHrefFromPath("./articles/index.md"); // "#/"
 * articleHrefFromPath("./articles/intro.md"); // "#/intro.md"
 * ```
 */
export function articleHrefFromPath(path?: string | null,): string {
  const normalized = normalizePath(path,);
  return normalized === "index.md" ? "#/" : `#/${normalized}`;
}

/**
 * @description Single heading entry extracted from a Wire AST tree for table of contents rendering.
 */
export interface TocHeading {
  /** @description Anchor id slug generated during wire conversion. */
  id: string;
  /** @description Plain text content of the heading. */
  text: string;
  /** @description Heading depth (2 = h2, 3 = h3, ...). */
  depth: number;
}

/**
 * @description Adjacent articles relative to the current one in reading order.
 */
export interface AdjacentArticles {
  /** @description Previous article in the flattened tree, or null at the start. */
  prev: ArticleItem | null;
  /** @description Next article in the flattened tree, or null at the end. */
  next: ArticleItem | null;
}

function extractText(node: Wire,): string {
  if (typeof node === "string") return node;
  if (typeof node === "number" || typeof node === "boolean") {
    return String(node,);
  }
  if (!node || typeof node !== "object") return "";
  if (Array.isArray(node,)) return node.map(extractText,).join("",);
  const children = (node as WireComponent).c;
  return Array.isArray(children,) ? children.map(extractText,).join("",) : "";
}

/**
 * @description Extracts table of contents entries (headings h2..h3 with anchor ids) from a Wire AST tree.
 * @param wire - Root or branch Wire node to inspect.
 * @param maxDepth - Maximum heading depth to include (defaults to 3).
 * @returns Ordered list of toc headings found in document order.
 * @example
 * ```ts
 * import { extractTocHeadings } from "./utils.ts";
 * const toc = extractTocHeadings({ t: "f", c: [{ t: "c", n: "Heading", p: { depth: 2, id: "intro" }, c: ["Intro"] }] });
 * ```
 */
export function extractTocHeadings(wire: Wire, maxDepth = 3,): TocHeading[] {
  const headings: TocHeading[] = [];
  const walk = (node: Wire,): void => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node,)) {
      for (const child of node) walk(child,);
      return;
    }
    const component = node as WireComponent;
    if (component.t === "c" && component.n === "Heading") {
      const depth = Number(component.p?.depth ?? 1,);
      const id = typeof component.p?.id === "string" ? component.p.id : "";
      if (id && depth >= 2 && depth <= maxDepth) {
        headings.push({
          id,
          text: extractText(component.c ?? [],),
          depth,
        },);
      }
    }
    if (Array.isArray(component.c,)) {
      for (const child of component.c) walk(child,);
    }
  };
  walk(wire,);
  return headings;
}

/**
 * @description Estimates article reading time in whole minutes based on word count (frontmatter excluded).
 * @param rawMarkdown - Raw markdown source of the document.
 * @param wordsPerMinute - Average reading speed (defaults to 200 wpm).
 * @returns Estimated reading time in minutes (minimum 1).
 * @example
 * ```ts
 * import { estimateReadingTimeMinutes } from "./utils.ts";
 * estimateReadingTimeMinutes("word ".repeat(400)); // 2
 * ```
 */
export function estimateReadingTimeMinutes(
  rawMarkdown: string,
  wordsPerMinute = 200,
): number {
  if (!rawMarkdown) return 1;
  const body = rawMarkdown.replace(/^---[\s\S]*?---/, " ",);
  const words = body.split(/\s+/,).filter((word,) => word.length > 0).length;
  return Math.max(1, Math.round(words / Math.max(1, wordsPerMinute,),),);
}

/**
 * @description Finds the previous and next articles relative to a given path following the flattened tree reading order.
 * @param list - Flattened articles list (pre-order) from state.
 * @param current - Current article route or path in any accepted variant.
 * @returns Object with prev/next ArticleItem references (null when at boundaries or not found).
 * @example
 * ```ts
 * import { findAdjacentArticles } from "./utils.ts";
 * const { prev, next } = findAdjacentArticles(articles.value, "#/intro.md");
 * ```
 */
export function findAdjacentArticles(
  list: ArticleItem[],
  current: string,
): AdjacentArticles {
  const index = list.findIndex(
    (item,) => normalizePath(item.path,) === normalizePath(current,),
  );
  if (index < 0) return { prev: null, next: null, };
  return {
    prev: index > 0 ? (list[index - 1] ?? null) : null,
    next: index < list.length - 1 ? (list[index + 1] ?? null) : null,
  };
}

/** @description Height budget of the table of contents rail, in the units BeerCSS understands. */
export interface TocRailHeight {
  /** @description BeerCSS fixed-height class to clamp the rail box with. */
  heightClass: string;
  /** @description Pixel height that class sets, i.e. the budget cut-off entries are measured against. */
  maxHeightPx: number;
}

/** @description One rail height tier: the BeerCSS class, the pixels it sets, and the screen height from which it still leaves room for the article header above the rail. */
export interface TocRailHeightTier extends TocRailHeight {
  /** @description Minimum viewport height (CSS pixels) this tier needs. */
  minViewportPx: number;
}

/**
 * @description The three height utilities BeerCSS ships, from the tallest down, exported so that the viewport watchers can build one media query per threshold instead of repeating the pixel numbers. There is no viewport-relative height class and no custom CSS is allowed, so the rail can only be clamped to one of these.
 */
export const TOC_RAIL_HEIGHT_TIERS: TocRailHeightTier[] = [
  { heightClass: "large-height", maxHeightPx: 576, minViewportPx: 720, },
  { heightClass: "medium-height", maxHeightPx: 384, minViewportPx: 480, },
  { heightClass: "small-height", maxHeightPx: 192, minViewportPx: 0, },
];

/**
 * @description Picks the height the table of contents rail is clamped to from the available screen height, so scrolling depends on the viewport instead of on the number of entries.
 * @param viewportHeightPx - Viewport height in CSS pixels (`window.innerHeight`).
 * @returns The tallest BeerCSS height class that fits the screen, together with its pixel value.
 * @example
 * ```ts
 * import { tocRailHeight } from "./utils.ts";
 * tocRailHeight(900); // { heightClass: "large-height", maxHeightPx: 576 }
 * tocRailHeight(400); // { heightClass: "small-height", maxHeightPx: 192 }
 * ```
 */
export function tocRailHeight(viewportHeightPx: number,): TocRailHeight {
  const tier = TOC_RAIL_HEIGHT_TIERS.find(
    (candidate,) => viewportHeightPx >= candidate.minViewportPx,
  );
  return tier
    ? { heightClass: tier.heightClass, maxHeightPx: tier.maxHeightPx, }
    : { heightClass: "small-height", maxHeightPx: 192, };
}

````

---

## File: `packages/mdblog/src/version.ts`

```ts
// Automatically generated file during build
declare const __APP_VERSION__: string;

/**
 * Current library/application version.
 * @type {string}
 */
// @ts-ignore: Identifier '__APP_VERSION__' is replaced by a string literal at build time
export const APP_VERSION: string = typeof __APP_VERSION__ !== "undefined"
  ? __APP_VERSION__
  : "";

```

---

## File: `packages/mdblog/tests/app_test.ts`

```ts
import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { fromFileUrl, } from "@std/path";

const distDir = fromFileUrl(
  new URL("../../server/build/dist", import.meta.url,),
);
const publicDir = fromFileUrl(new URL("../public", import.meta.url,),);
const srcDir = fromFileUrl(new URL("../src", import.meta.url,),);

async function runBuild(): Promise<void> {
  const command = new Deno.Command("deno", {
    args: ["task", "esbuild", "noversion",],
    stdout: "piped",
    stderr: "piped",
  },);
  const { code, } = await command.output();
  assertEquals(code, 0,);
}

describe("Build Script & Distribution", () => {
  it("bundles packages/mdblog and outputs dist with esbuild", async () => {
    await runBuild();

    // Checks that index.html exists in dist
    const indexStat = await Deno.stat(`${distDir}/index.html`,);
    assertEquals(indexStat.isFile, true,);

    // Checks that sw.js exists in dist
    const swStat = await Deno.stat(`${distDir}/sw.js`,);
    assertEquals(swStat.isFile, true,);

    // Checks that mdblog.js was generated from the library bundle
    const mdblogStat = await Deno.stat(`${distDir}/mdblog.js`,);
    assertEquals(mdblogStat.isFile, true,);

    // Reads the HTML and checks the mdblog.js script, the title and the absence of <style> tags
    const htmlContent = await Deno.readTextFile(`${distDir}/index.html`,);
    assert(htmlContent.includes("<title>mdBlog</title>",),);
    assert(htmlContent.includes('src="./mdblog.js"',),);
    assert(!htmlContent.includes("<style>",),);
    assert(!htmlContent.includes("style=",),);

    // Checks that the manifest is properly linked
    assert(htmlContent.includes('rel="manifest"',),);

    // Reads the built sw.js and checks its content
    const swContent = await Deno.readTextFile(`${distDir}/sw.js`,);
    assert(
      swContent.includes("mdTranspiler.version",),
      "the cache name must follow the build: a name fixed in the file lets one worker keep serving the shell and the assets of a build that no longer exists",
    );

    // Checks that the default public/sw.js demonstrates the use of the packaged library
    const publicSw = await Deno.readTextFile(`${publicDir}/sw.js`,);
    assert(
      publicSw.includes('from "./mdblog.js"',),
      "sw.js must show how it imports bundled library",
    );
    assert(
      publicSw.includes("createBrowserIO",),
      "sw.js must use createBrowserIO",
    );

    // Checks that src/mod.ts includes the library as a fallback when no app.js exists
    const mainSrc = await Deno.readTextFile(`${srcDir}/mod.ts`,);
    assert(
      mainSrc.includes("export {",),
      "mod.ts must export library components and utilities",
    );
    assert(
      mainSrc.includes("ComponentToMount",),
      "mod.ts must support mounting built-in App if app.js is absent",
    );
  });

  it("copies public assets and manifest into dist", async () => {
    const iconStat = await Deno.stat(`${distDir}/icon.svg`,);
    assertEquals(iconStat.isFile, true,);

    const manifestStat = await Deno.stat(`${distDir}/manifest.json`,);
    assertEquals(manifestStat.isFile, true,);

    const articlesStat = await Deno.stat(`${distDir}/articles`,);
    assertEquals(articlesStat.isDirectory, true,);

    const readmeStat = await Deno.stat(`${distDir}/articles/index.md`,);
    assertEquals(readmeStat.isFile, true,);

    const manifest = JSON.parse(
      await Deno.readTextFile(`${distDir}/manifest.json`,),
    );
    assertEquals(manifest.name, "mdBlog",);
  });

  it("verifies Sidebar uses BeerCSS scroll and compact classes in TypeScript (.ts)", async () => {
    const sidebarSrc = await Deno.readTextFile(
      `${srcDir}/components/Sidebar.ts`,
    );
    assert(sidebarSrc.includes("drawer scroll",),);
    assert(sidebarSrc.includes("small-padding",),);
    assert(sidebarSrc.includes('from "htm/preact"',),);
    assert(sidebarSrc.includes("html`",),);
    assert(!sidebarSrc.includes("style=",),);
    assert(!sidebarSrc.includes("<style>",),);
  });

  it("confirms all components and render registry in src use TypeScript (.ts)", async () => {
    async function checkDir(dir: string,) {
      for await (const entry of Deno.readDir(dir,)) {
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory) {
          await checkDir(path,);
        } else if (entry.isFile) {
          assert(
            entry.name.endsWith(".ts",),
            `Expected only .ts files in src: ${path}`,
          );
        }
      }
    }
    await checkDir(`${srcDir}/components`,);
    await checkDir(`${srcDir}/render`,);
  });
});

```

---

## File: `packages/mdblog/tests/articles_test.ts`

````ts
import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { fromFileUrl, } from "@std/path";
import { resolveDocPath, } from "../src/plugin/detect.ts";
import { parseFrontmatter, } from "../src/plugin/core/frontmatter.ts";
import { articles, } from "../src/state.ts";

const publicDir = fromFileUrl(new URL("../public", import.meta.url,),);
const srcDir = fromFileUrl(new URL("../src", import.meta.url,),);
const scriptsDir = fromFileUrl(new URL("../../../scripts", import.meta.url,),);

describe("Articles Architecture & Dynamic Blog", () => {
  it("verifies public/articles exists and contains markdown files including index.md", async () => {
    const stat = await Deno.stat(`${publicDir}/articles`,);
    assertEquals(stat.isDirectory, true,);

    const files: string[] = [];
    for await (const entry of Deno.readDir(`${publicDir}/articles`,)) {
      if (entry.isFile && entry.name.endsWith(".md",)) {
        files.push(entry.name,);
      }
    }

    assert(
      files.length >= 8,
      `Expected at least 8 markdown articles, found ${files.length}`,
    );
    assert(
      files.includes("index.md",),
      "index.md must be present in public/articles as home page",
    );
    assert(
      files.includes("overview.md",),
      "overview.md must be present in public/articles",
    );
    assert(
      files.includes("guide.md",),
      "guide.md must be present in public/articles",
    );
    assert(
      files.includes("migration-html-es.md",),
      "migration-html-es.md must be in public/articles",
    );

    // Shipped articles use plain lowercase ASCII slugs: an uppercase or accented
    // file name survives on a case-sensitive filesystem and silently 404s on a
    // case-insensitive one (and inside a URL it is a percent-encoded mess).
    for (const name of files) {
      assert(
        /^[a-z0-9][a-z0-9._-]*\.md$/.test(name,),
        `${name} must be a lowercase ASCII slug (letters, digits, dot, dash and underscore only)`,
      );
    }
  });

  it("parses YAML frontmatter correctly (scalars, lists, and dates)", () => {
    const sample = `---
title: "Test Title"
date: "2026-10-09"
author: "Vanaware"
location: "#/articles/test.md"
pages:
  - path: "overview.md"
    title: "Overview"
    icon: "article"
  - path: "guide.md"
    title: "Guide"
    icon: "science"
---
# Markdown Body
Plain text here.`;

    const { frontmatter, body, } = parseFrontmatter(sample,);
    assertEquals(frontmatter.title, "Test Title",);
    assertEquals(frontmatter.date, "2026-10-09",);
    assertEquals(frontmatter.author, "Vanaware",);
    assertEquals(frontmatter.location, "#/articles/test.md",);
    assertEquals(Array.isArray(frontmatter.pages,), true,);
    assertEquals(frontmatter.pages.length, 2,);
    assertEquals(frontmatter.pages[0].path, "overview.md",);
    assertEquals(frontmatter.pages[0].title, "Overview",);
    assert(body.includes("# Markdown Body",),);
    assert(!body.includes("---",),);
  });

  it("verifies index.md contains frontmatter with pages navigation list", async () => {
    const raw = await Deno.readTextFile(`${publicDir}/articles/index.md`,);
    const { frontmatter, body, } = parseFrontmatter(raw,);

    assert(
      typeof frontmatter.title === "string",
      "index.md must have a title in frontmatter",
    );
    assert(
      typeof frontmatter.date === "string",
      "index.md must have a date in frontmatter",
    );
    assert(
      Array.isArray(frontmatter.pages,),
      "index.md must have pages list in frontmatter",
    );
    assert(
      frontmatter.pages.length >= 3,
      "index.md pages list must contain main sections",
    );
    assert(
      body.includes("# 📖 mdBlog — Home Page",),
      "index.md body must contain content",
    );
  });

  it("verifies child pages contain their own sub-pages in frontmatter (recursive nesting)", async () => {
    // overview.md (level 1) declares sub-pages (level 2)
    const overviewRaw = await Deno.readTextFile(
      `${publicDir}/articles/overview.md`,
    );
    const { frontmatter: overviewFm, } = parseFrontmatter(overviewRaw,);
    assert(
      Array.isArray(overviewFm.pages,),
      "overview.md must declare sub-pages in frontmatter",
    );
    assert(overviewFm.pages.includes("wire-format.md",),);
    assert(overviewFm.pages.includes("flows.md",),);

    // wire-format.md (level 2) declares a sub-sub-page (level 3)
    const wireRaw = await Deno.readTextFile(
      `${publicDir}/articles/wire-format.md`,
    );
    const { frontmatter: wireFm, } = parseFrontmatter(wireRaw,);
    assert(
      Array.isArray(wireFm.pages,),
      "wire-format.md must declare sub-sub-pages in frontmatter",
    );
    assert(wireFm.pages.includes("wire-schema.md",),);

    // guide.md declares a sub-page
    const guideRaw = await Deno.readTextFile(`${publicDir}/articles/guide.md`,);
    const { frontmatter: guideFm, } = parseFrontmatter(guideRaw,);
    assert(Array.isArray(guideFm.pages,), "guide.md must declare sub-pages",);
    assert(guideFm.pages.includes("islands.md",),);

    // development-plan.md declares a sub-page
    const planRaw = await Deno.readTextFile(
      `${publicDir}/articles/development-plan.md`,
    );
    const { frontmatter: planFm, } = parseFrontmatter(planRaw,);
    assert(
      Array.isArray(planFm.pages,),
      "development-plan.md must declare sub-pages",
    );
    assert(planFm.pages.includes("migration-html-es.md",),);

    // Every declared sub-page must exist on disk, and every link of the body
    // must point at a real file: the hierarchy is discovered at runtime, so a
    // typo here is a 404 in the sidebar instead of a compile error.
    const declared = [
      ...overviewFm.pages,
      ...wireFm.pages,
      ...guideFm.pages,
      ...planFm.pages,
    ];
    for (const page of declared) {
      await Deno.stat(`${publicDir}/articles/${page}`,);
    }
  });

  it("verifies flattenArticles preserves depth, parentPath and recursive hierarchy", async () => {
    const { flattenArticles, } = await import("../src/state.ts");
    const mockTree = [
      {
        name: "index.md",
        slug: "index",
        path: "/articles/index.md",
        title: "Home",
        icon: "home",
        depth: 0,
        children: [
          {
            name: "doc1.md",
            slug: "doc1",
            path: "/articles/doc1.md",
            title: "Doc 1",
            icon: "article",
            depth: 1,
            parentPath: "/articles/index.md",
            children: [
              {
                name: "subdoc1.md",
                slug: "subdoc1",
                path: "/articles/subdoc1.md",
                title: "SubDoc 1",
                icon: "description",
                depth: 2,
                parentPath: "/articles/doc1.md",
                children: [
                  {
                    name: "subsubdoc.md",
                    slug: "subsubdoc",
                    path: "/articles/subsubdoc.md",
                    title: "SubSubDoc",
                    icon: "description",
                    depth: 3,
                    parentPath: "/articles/subdoc1.md",
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const flat = flattenArticles(mockTree,);
    assertEquals(flat.length, 4,);
    assertEquals(flat[0]!.depth, 0,);
    assertEquals(flat[1]!.depth, 1,);
    assertEquals(flat[2]!.depth, 2,);
    assertEquals(flat[3]!.depth, 3,);
    assertEquals(flat[3]!.parentPath, "/articles/subdoc1.md",);
  });

  it("confirms zero hardcoded articles lists in state.ts (starts as empty signal)", async () => {
    const stateSrc = await Deno.readTextFile(`${srcDir}/state.ts`,);
    assert(
      !stateSrc.includes("DEFAULT_ARTICLES",),
      "state.ts must NOT contain hardcoded DEFAULT_ARTICLES",
    );
    assert(
      !stateSrc.includes("const QUICK_ARTICLES",),
      "state.ts must NOT contain QUICK_ARTICLES",
    );
    assert(Array.isArray(articles.value,), "articles signal must be an array",);
  });

  it("confirms zero build-time indexing in build.ts (browser generates list)", async () => {
    const buildSrc = await Deno.readTextFile(`${scriptsDir}/esbuild.ts`,);
    assert(
      !buildSrc.includes("generateArticlesIndex",),
      "build script must NOT generate articles index during build",
    );
    assert(
      !buildSrc.includes("index.json",),
      "build script must NOT hardcode index.json generation",
    );
  });

  it("keeps the bundle evaluable inside the Service Worker scope", async () => {
    const swSrc = await Deno.readTextFile(`${publicDir}/sw.js`,);
    assert(
      swSrc.includes('import mdTranspiler from "./mdblog.js"',),
      "sw.js must keep importing the app bundle, which is why that bundle has to stay worker-safe",
    );

    const raw = await Deno.readTextFile(`${scriptsDir}/esbuild.jsonc`,);
    const config = JSON.parse(
      raw.replace(/^\s*\/\/.*$/gm, "",),
    ) as { targets: Record<string, { conditions?: string[] }> };

    for (const [name, target,] of Object.entries(config.targets,)) {
      assert(
        (target.conditions ?? []).includes("worker",),
        `esbuild target "${name}" must keep the "worker" export condition: sw.js imports the same bundle, and with only "browser" the exports map of decode-named-character-reference resolves to index.dom.js, whose top-level document.createElement throws "document is not defined" and makes the Service Worker script evaluation fail`,
      );
    }
  });

  it("resolves /articles/ routes correctly via resolveDocPath", () => {
    const res1 = resolveDocPath("/articles/guide", "/articles",);
    assertEquals(res1.isDoc, true,);
    assertEquals(res1.docPath, "/articles/guide.md",);

    const res2 = resolveDocPath("/articles", "/articles",);
    assertEquals(res2.isDoc, true,);
    assertEquals(res2.docPath, "/articles/index.md",);

    const res3 = resolveDocPath("/articles/overview.md", "/articles",);
    assertEquals(res3.isDoc, true,);
    assertEquals(res3.docPath, "/articles/overview.md",);

    // Backward compatibility for /docs/
    const resDocs = resolveDocPath("/docs/guide.md", "/articles",);
    assertEquals(resDocs.isDoc, true,);
    assertEquals(resDocs.docPath, "/docs/guide.md",);
  });

  it("verifies Navbar and Sidebar render articles dynamically, with Sidebar handling indented tree and Navbar without select box", async () => {
    const navbarSrc = await Deno.readTextFile(
      `${srcDir}/components/Navbar.ts`,
    );
    assert(
      navbarSrc.includes('href="#/"',),
      "Navbar home link must route to the dynamically resolved home article",
    );
    assert(
      !navbarSrc.includes("<select",),
      "Navbar must not use a select box",
    );
    assert(
      !navbarSrc.includes("<menu",),
      "Navbar must not use a dropdown select box",
    );
    assert(
      !navbarSrc.includes("const QUICK_ARTICLES",),
      "Navbar must not have hardcoded QUICK_ARTICLES",
    );
    assert(
      !navbarSrc.includes("const SECTIONS =",),
      "Navbar must not have hardcoded SECTIONS",
    );

    const sidebarSrc = await Deno.readTextFile(
      `${srcDir}/components/Sidebar.ts`,
    );
    assert(
      sidebarSrc.includes("articles.value",),
      "Sidebar must read articles from reactive signal",
    );
    assert(
      sidebarSrc.includes("item.depth",),
      "Sidebar must inspect item.depth for indentation",
    );
    assert(
      sidebarSrc.includes("left-margin",),
      "Sidebar must use left-margin indentation class for sub-pages",
    );
    assert(
      !sidebarSrc.includes("subdirectory_arrow_right",),
      "Sidebar must NOT use indentation arrow icons",
    );
    assert(
      !sidebarSrc.includes("const SECTIONS =",),
      "Sidebar must not have hardcoded SECTIONS",
    );
  });

  it("keeps the app bar brand horizontal and its contents within the bar width", async () => {
    const navbarSrc = await Deno.readTextFile(
      `${srcDir}/components/Navbar.ts`,
    );
    const brandIndex = navbarSrc.indexOf('href="#/"',);
    assert(brandIndex > -1, "Navbar must expose the home link",);
    // An `a` that is a direct child of nav.top is treated by BeerCSS as a
    // navigation item (flex-direction: column and the icon inside a pill), which
    // stacks the icon on top of the name. The brand must live in its own box.
    const beforeBrand = navbarSrc.slice(0, brandIndex,);
    assert(
      beforeBrand.lastIndexOf("<div",) > beforeBrand.lastIndexOf("<nav",),
      "Navbar brand link must be nested in a container, not a direct child of nav.top",
    );

    const searchSrc = await Deno.readTextFile(
      `${srcDir}/components/SearchBox.ts`,
    );
    assert(
      searchSrc.includes("isWideScreen.value",),
      "Search triggers must be mutually exclusive in the DOM: BeerCSS s/m/l classes leak on fractional viewport widths (browser zoom), showing both controls at once and overflowing the app bar",
    );
    assert(
      !searchSrc.includes('class="circle transparent s',),
      "Compact search button must not depend on breakpoint classes",
    );
    assert(
      !searchSrc.includes('no-margin l"',),
      "Inline search field must not depend on breakpoint classes",
    );
  });

  it("keeps the table of contents openable and closable on every breakpoint", async () => {
    const contentSrc = await Deno.readTextFile(
      `${srcDir}/components/Content.ts`,
    );
    const stateSrc = await Deno.readTextFile(`${srcDir}/state.ts`,);

    assert(
      contentSrc.includes("toggleToc",),
      "Content.ts must expose one table of contents control for both modes",
    );
    assert(
      contentSrc.includes("tocRailOpen.value = !tocRailOpen.value",),
      "The control must both hide and show the wide-screen summary column",
    );
    assert(
      contentSrc.includes("tocRailOpen.value = false",),
      "The summary column must offer its own close button",
    );
    assert(
      !/showRail = hasToc && isWideScreen\.value;/.test(contentSrc,),
      "The summary column must not be rendered unconditionally on wide screens",
    );
    assert(
      stateSrc.includes("TOC_STORAGE_KEY",),
      "The summary column preference must be persisted like the sidebar's",
    );
  });

  it("lays the search panel out as one horizontal header with its actions at the end", async () => {
    const searchSrc = await Deno.readTextFile(
      `${srcDir}/components/SearchBox.ts`,
    );
    // The comments name the very classes that are forbidden, so they are
    // stripped before any markup check runs.
    const markup = searchSrc.replace(/<!--[\s\S]*?-->/g, "",);

    // O BeerCSS define header como flex-direction:column + justify-content:center,
    // which stacked the "Esc" chip and the close button in the middle of the panel.
    assertEquals(
      /<header[\s>]/.test(markup,),
      false,
      "The search panel header must not be a <header> element (BeerCSS stacks and centers it)",
    );
    assert(
      markup.includes('<div class="row no-margin">',),
      "The panel header must be a single horizontal .row",
    );
    assert(
      markup.includes('<div class="max"></div>',),
      "The header must use the .max spacer to push its actions to the end (BeerCSS has no justify-between)",
    );
    assert(
      markup.includes('"active large-width" : "active max"',),
      "The dialog must take a fixed readable width on wide screens and the full screen on narrow ones",
    );
    assert(
      /class="row wave round [\w- ]*vertical-margin/.test(markup,),
      "Result rows need an !important margin utility: BeerCSS declares margin:0 on every a.row, which welds the cards together",
    );
    assert(
      markup.includes('<div class="max truncate">',),
      "The text column must be a scroll container (.truncate): a flex item with overflow:visible refuses to shrink below its nowrap text, which cuts titles mid-glyph and pushes the trailing icon out of the panel",
    );
    for (
      const ghost of ["medium round shadow", 'class="column', "gap-tiny",]
    ) {
      assertEquals(
        markup.includes(ghost,),
        false,
        `BeerCSS 3.7.12 has no "${ghost}" utility; the class is silently ignored and breaks the layout`,
      );
    }
  });

  it("confirms zero static fallback files (articles.json and articles/index.html removed) and discovery is purely frontmatter-driven", async () => {
    let hasArticlesJson = false;
    try {
      await Deno.stat(`${publicDir}/articles/articles.json`,);
      hasArticlesJson = true;
    } catch {
      hasArticlesJson = false;
    }
    assertEquals(
      hasArticlesJson,
      false,
      "articles.json static fallback must NOT exist",
    );

    let hasArticlesIndexHtml = false;
    try {
      await Deno.stat(`${publicDir}/articles/index.html`,);
      hasArticlesIndexHtml = true;
    } catch {
      hasArticlesIndexHtml = false;
    }
    assertEquals(
      hasArticlesIndexHtml,
      false,
      "articles/index.html static fallback must NOT exist",
    );
  });

  it("verifies search indexing cleans markdown content dynamically for full-text search", async () => {
    const { cleanMarkdownText, } = await import("../src/state.ts");
    const sample =
      "# Main Title\n\nText with `code` and [link](https://example.com).\n\n```js\nconst x = 1;\n```";
    const cleaned = cleanMarkdownText(sample,);
    assert(cleaned.includes("Main Title",),);
    assert(cleaned.includes("Text with code and link",),);
    assert(!cleaned.includes("```",),);
    assert(!cleaned.includes("#",),);
  });

  it("verifies Content.ts implements clean layout: discreet breadcrumb, title/author/date, wrapped sub-pages without indentation icons, and Made with mdBlog footer", async () => {
    const contentSrc = await Deno.readTextFile(
      `${srcDir}/components/Content.ts`,
    );

    // 1. Discreet breadcrumbs with tight spacing and responsive wrapping
    assert(
      contentSrc.includes("breadcrumbs",),
      "Content.ts must build breadcrumbs",
    );
    assert(
      contentSrc.includes("chevron_right",),
      "Content.js must use subtle chevron_right divider",
    );
    assert(
      contentSrc.includes("small-text secondary-text",),
      "Breadcrumb must be subtle and discreet",
    );
    assert(
      contentSrc.includes("no-space",),
      "Breadcrumb must use no-space to avoid excessive spacing between items",
    );
    assert(
      contentSrc.includes("row wrap",),
      "Breadcrumb must have wrap to fit on small screens",
    );

    // 2. Header with title, author, date
    assert(
      contentSrc.includes("<header",),
      "Content.js must have clean article header",
    );
    assert(contentSrc.includes("author",), "Header must include author",);
    assert(contentSrc.includes("date",), "Header must include date",);

    // 2b. Narrow-screen spacing contract. BeerCSS has no directional border and
    // no gap-* utility, and a name shaped like one (border-top, gap-small) is
    // silently ignored — that is what let the content sit flush against the
    // card's edge. Separators are dividers, and the article keeps the padding
    // the framework gives the <article> element itself.
    assert(
      contentSrc.includes("medium-divider",),
      "Header and footer must be separated by a real BeerCSS divider",
    );
    assert(
      !/class="[^"]*\bborder-(top|bottom|left|right)\b/.test(contentSrc,),
      "Content.ts must not use the non-existent border-* classes",
    );
    assert(
      !/class="[^"]*\bgap-(tiny|small|medium|large)\b/.test(contentSrc,),
      "Content.ts must not use the non-existent gap-* classes",
    );
    assert(
      contentSrc.includes(`<article class="wrap">`,),
      "The article body must keep the padding BeerCSS gives an <article> card",
    );

    // 3. Article content before sub-pages list
    const articleIdx = contentSrc.indexOf("wireToVNode",);
    const subpagesIdx = contentSrc.indexOf("Sub-pages",);
    assert(articleIdx > 0, "Content.js must render wireToVNode",);
    assert(subpagesIdx > 0, "Content.js must render sub-pages list",);
    assert(
      articleIdx < subpagesIdx,
      "Article content must be rendered BEFORE sub-pages list",
    );

    // 4. Sub-pages: no indentation icons, and text wrapped to avoid overflow
    assert(
      !contentSrc.includes("subdirectory_arrow_right",),
      "Sub-pages must not use indentation icons",
    );
    assert(
      contentSrc.includes("bold wrap",) &&
        !contentSrc.includes("bold small-text wrap",),
      "Sub-page and pager titles must be bold at the size of the body text: a title smaller than the prose it introduces reads as a caption",
    );
    assert(
      contentSrc.includes("row wrap",),
      "Sub-page cards must wrap on small screens",
    );
    assert(
      contentSrc.includes(`class="vertical top-margin small-margin"`,),
      "Sub-pages must stack with .vertical (BeerCSS has no .column)",
    );
    assert(
      contentSrc.includes("bottom-margin small-margin",),
      "Each sub-page card must carry its own bottom margin: a flex column has no gap",
    );

    // 5. Clean footer with only 'Made with mdBlog'
    assert(
      contentSrc.includes("Made with mdBlog",),
      "Footer must contain 'Made with mdBlog'",
    );
    assert(
      !contentSrc.includes("dangerouslySetInnerHTML",),
      "Footer must not contain debug strings",
    );
  });

  it("shows the compiled app version in the Made with mdBlog footer", async () => {
    const contentSrc = await Deno.readTextFile(
      `${srcDir}/components/Content.ts`,
    );
    const versionSrc = await Deno.readTextFile(`${srcDir}/version.ts`,);

    assert(
      contentSrc.includes('from "../version.ts"',),
      "Content.ts must read the version from version.ts, the file the build stamps",
    );
    assert(
      contentSrc.includes('APP_VERSION ? ` ${APP_VERSION}` : ""',),
      "an un-stamped (unbundled) version must disappear, not leave a loose space",
    );
    assert(
      versionSrc.includes('typeof __APP_VERSION__ !== "undefined"',),
      "version.ts must keep the typeof guard: without a bundler there is no define, and a bare reference would throw ReferenceError",
    );

    const footer = contentSrc.match(/<footer[\s\S]*?<\/footer>/,)?.[0] ?? "";
    assert(
      footer.includes("Made with mdBlog",),
      "the footer must keep the tagline",
    );
    assert(
      footer.includes("versionSuffix",),
      "the version must be rendered in the footer",
    );
    // BeerCSS gives <footer> flex-direction:column, so the name and the version
    // share a single <span>; a second element would drop onto another line.
    assertEquals(
      footer.match(/<(?!\/)/g,)?.length ?? 0,
      2,
      "footer must hold exactly one element",
    );
  });
});

````

---

## File: `packages/mdblog/tests/beer_classes_test.ts`

```ts
import { assert, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { fromFileUrl, } from "@std/path";

/**
 * @description Directory holding the component and renderer sources.
 */
const srcDir = fromFileUrl(new URL("../src/", import.meta.url,),);

/**
 * @description Directory holding the static assets and the demo islands.
 */
const publicDir = fromFileUrl(new URL("../public/", import.meta.url,),);

/**
 * Utility class names that are NOT part of BeerCSS. They are all names a
 * Tailwind/CSS-first mind invents, and the framework silently ignores them —
 * which is worse than an error, because the layout then quietly loses the
 * spacing or the separator the name promised (the narrow-screen complaints of
 * this project were all traces of these classes).
 *
 * The right alternatives, all verified against beer.min.css 3.7.12:
 * - gap-small / gap-tiny / gap-medium / gap: the gap of a .row is its own 1rem
 *   default, settable only to 0 (.no-space), 1.5rem (.medium-space) or 2rem
 *   (.large-space); tighter rhythm comes from a directional margin class.
 * - items-center: every nav and .row already is align-items:center.
 * - justify-between: use a <div class="max"></div> spacer (flex:1).
 * - column: use .vertical.
 * - border-top / border-bottom / border-right / border-left / left-border:
 *   there is no directional border utility; separators are
 *   <div class="medium-divider"></div> and depth is .elevate.
 * - border-primary / surface-text / surface-variant-text / success-text /
 *   tiny-text / opacity-50 / uppercase / sticky / min: the palette is
 *   primary/secondary/tertiary/error/inverse-primary/black/white-text plus the
 *   fixed colour names (green-text, ...), the sizes are small/medium/large-text,
 *   the opacity is .medium-opacity, and shrinking text uses .truncate.
 * - margin-bottom / padding-top / medium-padding: the worst of them, because
 *   BeerCSS reads spacing with the attribute selector [class*=margin] (and
 *   [class*=padding]). A name in the wrong word order still matches it, so the
 *   element silently gets the default ONE REM on every side instead of the one
 *   side it asked for; medium-* is the same trap on the default value. The real
 *   directions are top/bottom/left/right/horizontal/vertical-margin (or
 *   -padding) and the sizes are tiny (.25rem), small (.5rem), the bare name
 *   (1rem) and large (1.5rem).
 */
const INVENTED_CLASSES = [
  "gap-tiny",
  "gap-small",
  "gap-medium",
  "gap-large",
  "items-center",
  "justify-between",
  "column",
  "border-top",
  "border-bottom",
  "border-left",
  "border-right",
  "left-border",
  "border-primary",
  "surface-text",
  "surface-variant-text",
  "success-text",
  "tiny-text",
  "opacity-50",
  "uppercase",
  "sticky",
  "margin-bottom",
  "margin-top",
  "margin-left",
  "margin-right",
  "padding-top",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "medium-margin",
  "medium-padding",
];

/**
 * @description Removes the comments of a source file.
 *
 * Comments are where these class names legitimately appear as documentation of
 * what not to write, so they are stripped before the scan. A double slash only
 * starts a comment when it is not part of a protocol in a string, and the markup
 * comments of the templates (which is where the rationale of a class is written
 * down) go the same way.
 */
function stripComments(source: string,): string {
  return source
    .replace(/<!--[\s\S]*?-->/g, "",)
    .replace(/\/\*[\s\S]*?\*\//g, "",)
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1",);
}

/**
 * @description Lists the source files whose markup must stay BeerCSS-honest.
 *
 * Every component and renderer module is picked up, so a new view file is
 * covered the moment it is written instead of the moment someone remembers to
 * add it to a list. The demo islands are scanned too: they are the markup users
 * copy from, and they are plain browser JavaScript, not TypeScript.
 */
async function templateSources(): Promise<Record<string, string>> {
  const roots = [
    { base: `${srcDir}/components`, ext: ".ts", label: "components", },
    { base: `${srcDir}/render`, ext: ".ts", label: "render", },
    {
      base: `${srcDir}/plugin/core`,
      ext: ".ts",
      label: "plugin/core",
    },
    { base: `${publicDir}/islands`, ext: ".js", label: "public/islands", },
  ];
  const out: Record<string, string> = {};
  for (const { base, ext, label, } of roots) {
    for await (const entry of Deno.readDir(base,)) {
      if (!entry.isFile || !entry.name.endsWith(ext,)) continue;
      const file = `${label}/${entry.name}`;
      out[file] = stripComments(
        await Deno.readTextFile(`${base}/${entry.name}`,),
      );
    }
  }
  return out;
}

describe("BeerCSS class vocabulary", () => {
  it("does not use utility names the framework does not implement", async () => {
    const sources = await templateSources();
    for (const [file, source,] of Object.entries(sources,)) {
      for (const name of INVENTED_CLASSES) {
        const used = new RegExp(`\\b${name}\\b`,).test(source,);
        assert(
          !used,
          `${file} uses the class "${name}", which BeerCSS does not implement — see the INVENTED_CLASSES table in tests/beer_classes_test.ts for the real utility`,
        );
      }
    }
  });

  it("sizes every margin and padding class with a single value", async () => {
    // Every *margin / *padding utility of BeerCSS reads one custom property
    // (--margin / --padding) that the element holds as a single value, so two
    // size classes on one element (small-margin large-margin) fight over it and
    // one silently wins by stylesheet order. Directional classes
    // (top/left/...) are excluded from the all-sides rule, which is also why an
    // element carrying one must not also carry no-margin/no-padding: the size
    // class would set the very variable the directional class reads to zero.
    const sources = await templateSources();
    const sizeClasses = [
      "no-margin",
      "tiny-margin",
      "small-margin",
      "large-margin",
      "auto-margin",
      "margin",
    ];
    const paddingSizes = [
      "no-padding",
      "tiny-padding",
      "small-padding",
      "large-padding",
      "padding",
    ];
    const classAttrs =
      /class(?:Name)?=\$?\{?(?:"([^"]*)"|`([^`]*)`|'([^']*)')/g;
    for (const [file, source,] of Object.entries(sources,)) {
      for (const match of source.matchAll(classAttrs,)) {
        const value = match[1] ?? match[2] ?? match[3] ?? "";
        const tokens = value.split(/[\s${}?:'"()]+/,).filter(Boolean,);
        const margins = tokens.filter((t,) => sizeClasses.includes(t,));
        const paddings = tokens.filter((t,) => paddingSizes.includes(t,));
        assert(
          margins.length <= 1,
          `${file} sets two margin sizes (${
            margins.join(", ",)
          }) on one element: they write the same --margin variable`,
        );
        assert(
          paddings.length <= 1,
          `${file} sets two padding sizes (${
            paddings.join(", ",)
          }) on one element: they write the same --padding variable`,
        );
      }
    }
  });
});

```

---

## File: `packages/mdblog/tests/docs_test.ts`

````ts
import { assert, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { fromFileUrl, } from "@std/path";

/**
 * @description Repository documentation folder (the guides read on GitHub).
 */
const docsDir = fromFileUrl(new URL("../../../docs", import.meta.url,),);

/**
 * @description Folder holding the markdown documents served by the app itself.
 */
const articlesDir = fromFileUrl(
  new URL("../public/articles", import.meta.url,),
);

/**
 * @description The naming convention every document follows.
 *
 * A document name is also a URL segment, so an uppercase or accented name is a
 * trap: it survives on the case-insensitive filesystem of the developer machine
 * and 404s on the case-sensitive one of the CI server and of GitHub Pages.
 */
const SLUG_PATTERN = /^[a-z0-9][a-z0-9._-]*\.md$/;

/**
 * @description Lists the markdown files of a directory (non-recursive).
 */
async function markdownFiles(dir: string,): Promise<string[]> {
  const names: string[] = [];
  for await (const entry of Deno.readDir(dir,)) {
    if (entry.isFile && entry.name.endsWith(".md",)) names.push(entry.name,);
  }
  return names.sort();
}

/**
 * @description Removes fenced code blocks from a markdown document.
 *
 * An example of a link inside a tutorial is not a link: only the markup outside
 * the fences is the real navigation of the document.
 */
function withoutCodeBlocks(source: string,): string {
  return source.replace(/^```[\s\S]*?^```[ \t]*$/gm, "",);
}

describe("Documentation files", () => {
  it("uses lowercase ascii slugs in docs/ and in the served articles", async () => {
    for (const dir of [docsDir, articlesDir,]) {
      const files = await markdownFiles(dir,);
      assert(files.length > 0, `${dir} holds no markdown at all`,);
      for (const name of files) {
        // README.md is the one conventional exception: it is the index a
        // repository host renders for a folder, and its name is not free.
        if (name === "README.md") continue;
        assert(
          SLUG_PATTERN.test(name,),
          `${dir}/${name} is not a lowercase ascii slug (letters, digits, dot, dash and underscore)`,
        );
      }
    }
  });

  it("links only documents that exist", async () => {
    const link = /\[[^\]]*\]\((?!https?:|\/|#)([^)#\s]+\.md)(#[^)]*)?\)/g;
    for (const dir of [docsDir, articlesDir,]) {
      for (const name of await markdownFiles(dir,)) {
        const source = withoutCodeBlocks(
          await Deno.readTextFile(`${dir}/${name}`,),
        );
        for (const match of source.matchAll(link,)) {
          const target = match[1] ?? "";
          if (!target) continue;
          const path = `${dir}/${target}`;
          let exists = true;
          try {
            await Deno.stat(path,);
          } catch {
            exists = false;
          }
          assert(
            exists,
            `${name} links to "${target}", which is not a file next to it`,
          );
        }
      }
    }
  });
});

````

---

## File: `packages/mdblog/tests/hydrate_islands_test.ts`

```ts
import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import {
  hydrateIslands,
  inFlightImports,
} from "../src/render/hydrate-islands.ts";

/**
 * These tests stub `location` and `document` on the global scope: hydration is
 * browser-side code, but the failure path under test (an island import that
 * rejects) only needs the URL base to resolve the attempt against — no real
 * DOM. Nothing here mounts a component, so no preact rendering is involved.
 */
describe("Island import retry", () => {
  it("evicts a failed import so a later pass can retry it", async () => {
    const g = globalThis as Record<string, unknown>;
    // An absolute base pointing at a folder that cannot hold the island file:
    // both the resolved URL and the relative fallback of the import reject.
    g.location = new URL("file:///tmp/mdblog-missing-islands/index.html",);
    g.document = { body: null, };

    const el = {
      dataset: { island: "Ghost", props: "{}", } as Record<string, string>,
    };
    const root = {
      querySelectorAll: () => [el as unknown as HTMLElement,],
    } as unknown as HTMLElement;

    try {
      const hydrated = await hydrateIslands({ root, },);
      assertEquals(hydrated, 0,);
      assert(
        el.dataset.islandError === "true",
        "the failed container is marked for the fallback notice",
      );
      assertEquals(
        Object.keys(inFlightImports,).length,
        0,
        "a rejected import must not stay memoized forever",
      );

      // A second pass is free to attempt the very same island again
      const second = await hydrateIslands({ root, },);
      assertEquals(second, 0,);
      assertEquals(Object.keys(inFlightImports,).length, 0,);
    } finally {
      delete g.location;
      delete g.document;
    }
  });
});

```

---

## File: `packages/mdblog/tests/islands_test.ts`

````ts
import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { fromFileUrl, } from "@std/path";
import { parseMarkdown, } from "../src/plugin/core/parse.ts";

const publicDir = fromFileUrl(new URL("../public", import.meta.url,),);
import { mdastToWire, } from "../src/plugin/core/to-wire.ts";
import type { WireComponent, WireIsland, } from "../src/plugin/wire.ts";

describe("Islands Architecture (Dynamic File-Based, Zero Fixed Lists)", () => {
  it("identifies code block islands by filename (```island:Counter.js)", () => {
    const md = `
# Teste de Ilha

\`\`\`island:Counter.js
{"start": 15, "step": 3}
\`\`\`
`;
    const root = parseMarkdown(md,);
    // No hard-coded component set needed - the file is discovered dynamically
    const { wire, } = mdastToWire(root,);

    assert(wire.c && wire.c.length >= 2,);
    const islandNode = wire.c[1] as WireIsland;
    assertEquals(islandNode.t, "i",);
    assertEquals(islandNode.n, "Counter.js",);
    assertEquals(islandNode.p?.start, 15,);
    assertEquals(islandNode.p?.step, 3,);
  });

  it("identifies directive islands by filename (::Counter.js{start: 20})", () => {
    const md = "::Counter.js{start: 20, step: 2}";
    const root = parseMarkdown(md,);
    const { wire, } = mdastToWire(root,);

    assert(wire.c && wire.c.length === 1,);
    const islandNode = wire.c[0] as WireIsland;
    assertEquals(islandNode.t, "i",);
    assertEquals(islandNode.n, "Counter.js",);
    assertEquals(islandNode.p?.start, 20,);
    assertEquals(islandNode.p?.step, 2,);
  });

  it("does not convert regular code blocks to islands", () => {
    const md = "```typescript\nconsole.log(123);\n```";
    const root = parseMarkdown(md,);
    const { wire, } = mdastToWire(root,);

    assert(wire.c && wire.c.length === 1,);
    const node = wire.c[0] as WireComponent;
    assertEquals(node.t, "c",);
    assertEquals(node.n, "CodeBlock",);
    assertEquals(node.p?.lang, "typescript",);
  });

  it("verifies dynamic islands exist as pure HTML+ES files exclusively in islands folder (no singular alias)", async () => {
    // Checks that the standalone static islands exist in public/islands as ES Modules
    const demoWidgetCode = await Deno.readTextFile(
      `${publicDir}/islands/DemoWidget.js`,
    );
    assert(
      demoWidgetCode.includes('from "../mdblog.js"',) ||
        demoWidgetCode.includes("mdBlog",),
    );
    assert(demoWidgetCode.includes("html`",),);
    assert(demoWidgetCode.includes("export function DemoWidget",),);

    const publicCounterCode = await Deno.readTextFile(
      `${publicDir}/islands/Counter.js`,
    );
    assert(
      publicCounterCode.includes('from "../mdblog.js"',) ||
        publicCounterCode.includes("mdBlog",),
    );
    assert(publicCounterCode.includes("html`",),);

    // Confirms there is no 'island' singular folder or symlink (only the 'islands' option is kept)
    let hasIslandSingular = false;
    try {
      await Deno.stat(`${publicDir}/island`,);
      hasIslandSingular = true;
    } catch {
      hasIslandSingular = false;
    }
    assertEquals(
      hasIslandSingular,
      false,
      "The public/island singular folder must not exist; only public/islands",
    );
  });
});

````

---

## File: `packages/mdblog/tests/pipeline_test.ts`

```ts
import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { parseMarkdown, } from "../src/plugin/core/parse.ts";
import { mdastToWire, } from "../src/plugin/core/to-wire.ts";
import { loadDoc, processMarkdown, } from "../src/plugin/core/pipeline.ts";
import { createMemoryIO, } from "../src/plugin/core/io.ts";
import {
  countWireIslands,
  countWireNodes,
  sanitizeProps,
} from "../src/plugin/wire.ts";
import type { WireComponent, WireElement, } from "../src/plugin/wire.ts";

describe("Pipeline & Wire Format Core", () => {
  it("parses markdown and extracts the first h1 title", () => {
    const md = "# My Amazing Title\n\nThis is a paragraph.";
    const root = parseMarkdown(md,);
    const { wire, title, } = mdastToWire(root,);

    assertEquals(title, "My Amazing Title",);
    assertEquals(wire.t, "f",);
    assert(Array.isArray(wire.c,),);
    assertEquals(wire.c.length, 2,);

    const heading = wire.c[0] as WireComponent;
    assertEquals(heading.t, "c",);
    assertEquals(heading.n, "Heading",);
    assertEquals(heading.p?.depth, 1,);
  });

  it("discards raw HTML nodes completely for safety", () => {
    const md =
      "Safe text <script>alert('xss')</script> and <div onclick='bad()'>test</div> ending.";
    const root = parseMarkdown(md,);
    const { wire, } = mdastToWire(root,);

    const serialized = JSON.stringify(wire,);
    assert(!serialized.includes("<script>",),);
    assert(!serialized.includes("onclick",),);
    assert(!serialized.includes("bad()",),);
  });

  it("processes GFM tables, task lists, and code blocks", () => {
    const md = `
| Name | Type |
|---|---|
| Item 1 | Value |

- [x] Done task
- [ ] Pending task

\`\`\`ts
const x = 42;
\`\`\`
`;
    const doc = processMarkdown(md, "/docs/test.md",);
    assertEquals(doc.url, "/docs/test.md",);
    assert(doc.renderedAt > 0,);

    const serialized = JSON.stringify(doc.wire,);
    assert(serialized.includes('"n":"Table"',),);
    assert(serialized.includes('"n":"CodeBlock"',),);
    assert(serialized.includes('"value":"const x = 42;"',),);
    assert(serialized.includes('"checked":true',),);
  });

  it("splits GFM tables into thead/tbody and marks header cells", () => {
    const md =
      "| Name | Type | Qty |\n|:---|:---:|---:|\n| Item 1 | Value | 3 |\n";
    const { wire, } = mdastToWire(parseMarkdown(md,),);
    assert(Array.isArray(wire.c,),);

    const table = wire.c[0] as WireComponent;
    assertEquals(table.n, "Table",);
    assert(Array.isArray(table.c,),);
    const sections = table.c as unknown as WireElement[];
    const [headSection, bodySection,] = sections;

    // BeerCSS stripes and the header border only exist over tbody/thead.
    assertEquals(
      sections.map((s,) => `${s.t}:${s.n}`),
      ["e:thead", "e:tbody",],
      "BeerCSS stripes and the header border only apply to a real thead/tbody structure",
    );

    const cellsOf = (section: WireElement | undefined,) => {
      assert(section, "the table must be split into sections",);
      const [row,] = (section.c ?? []) as WireComponent[];
      assert(row, "each section must carry its row",);
      return (row.c ?? []) as unknown as WireComponent[];
    };

    const headCells = cellsOf(headSection,);
    assertEquals(
      headCells.map((c,) => c.p?.header),
      [true, true, true,],
      "first-row cells must be flagged as headers",
    );
    assertEquals(
      headCells.map((c,) => c.p?.align),
      ["left", "center", "right",],
      "column alignment lives on the table node but must reach each cell",
    );
    assertEquals(
      cellsOf(bodySection,).map((c,) => c.p?.header),
      [false, false, false,],
      "body cells must not be headers",
    );
  });

  it("handles document caching and TTL expiration via IO", async () => {
    const memoryIO = createMemoryIO({
      "/docs/cached.md": "# Version 1\n\nInitial content.",
    },);

    const doc1 = await loadDoc("/docs/cached.md", memoryIO, {
      cacheTTLSeconds: 10,
    },);
    assertEquals(doc1.title, "Version 1",);

    // Manually overwrite file in IO without waiting for TTL
    const cacheKey = "wire:/docs/cached.md";
    const cachedRaw = await memoryIO.cacheGet(cacheKey,);
    assert(cachedRaw !== null,);

    // Call again immediately: should return cached version
    const doc2 = await loadDoc("/docs/cached.md", memoryIO, {
      cacheTTLSeconds: 10,
    },);
    assertEquals(doc2.renderedAt, doc1.renderedAt,);
  });

  it("sanitizes props to ensure 100% JSON serializability", () => {
    const circular: Record<string, unknown> = { a: 1, };
    circular.self = circular;

    const sanitized = sanitizeProps(circular,);
    assertEquals(sanitized, {},);

    const clean = sanitizeProps({ name: "Counter", start: 5, },);
    assertEquals(clean, { name: "Counter", start: 5, },);
  });

  it("calculates node counts and detects islands in Wire tree", () => {
    const markdown =
      `# Title\n\nTest text with [link](https://deno.com)\n\n::Counter{start: 10}`;
    const doc = processMarkdown(markdown, "/test.md",);

    const totalNodes = countWireNodes(doc.wire,);
    const islandCount = countWireIslands(doc.wire,);

    assert(totalNodes > 3,);
    assertEquals(islandCount, 1,);
  });
});

```

---

## File: `packages/mdblog/tests/registry_test.ts`

```ts
import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import type { VNode, } from "preact";
import { wireToVNode, } from "../src/render/from-wire.ts";
import { dynamicIslandsCache, } from "../src/render/hydrate-islands.ts";
import { slugify, } from "../src/plugin/detect.ts";
import type {
  WireComponent,
  WireFragment,
  WireIsland,
} from "../src/plugin/wire.ts";

describe("Render Layer & Registry", () => {
  it("slugifies heading text into URL-friendly IDs", () => {
    assertEquals(
      slugify("Crème Brûlée — Résumé!",),
      "creme-brulee-resume",
    );
    assertEquals(slugify("Getting Started & Setup",), "getting-started-setup",);
    assertEquals(slugify("   Extra spaces   ",), "extra-spaces",);
  });

  it("converts WireFragment into Preact VNodes without dangerouslySetInnerHTML", () => {
    const fragment: WireFragment = {
      t: "f",
      c: [
        {
          t: "c",
          n: "Heading",
          p: { depth: 2, id: "subtitle", },
          c: ["Test Subtitle",],
        } as WireComponent,
        {
          t: "c",
          n: "Paragraph",
          p: {},
          c: ["Paragraph text.",],
        } as WireComponent,
      ],
    };

    const vnode = wireToVNode(fragment,);
    assert(vnode !== null,);

    const serialized = JSON.stringify(vnode,);
    assert(!serialized.includes("dangerouslySetInnerHTML",),);
  });

  it("renders headings with BeerCSS wrap class and balanced hierarchy without non-wrapping row", async () => {
    const { Heading, } = await import("../src/render/registry.ts");
    const h1Node = Heading({
      depth: 1,
      id: "main-title",
      children: "Main Title",
    },) as VNode<{ class: string }>;
    const h2Node = Heading({
      depth: 2,
      id: "section",
      children: "Subsection",
    },) as VNode<{ class: string }>;

    // depth 1 maps to h4 with wrap class
    assertEquals(h1Node.type, "h4",);
    assert(h1Node.props.class.includes("wrap",),);
    assert(!h1Node.props.class.includes("row",),);

    // depth 2 maps to h5 with wrap class
    assertEquals(h2Node.type, "h5",);
    assert(h2Node.props.class.includes("wrap",),);
  });

  it("renders a striped table with a distinct header band", async () => {
    const { Table, TableRow, TableCell, } = await import(
      "../src/render/registry.ts"
    );

    const wrapper = Table({ children: "sections", },) as VNode<{
      children: VNode<{ class: string }>;
    }>;
    const table = wrapper.props.children;
    assertEquals(table.type, "table",);
    // "stripes" is the only source of the alternating background (table.stripes >
    // tbody > tr:nth-child(odd) uses --active, the same translucent gray in both
    // themes).
    assert(table.props.class.includes("stripes",),);
    assert(table.props.class.includes("border",),);

    const head = TableCell({
      header: true,
      align: "center",
      children: "Qty",
    },) as VNode<{ class: string }>;
    assertEquals(head.type, "th",);
    assert(head.props.class.includes("primary-container",),);
    // GFM alignment only reaches the screen through the BeerCSS classes, which
    // are exactly these three; any other name would be silently ignored.
    assert(head.props.class.includes("center-align",),);

    const unknownAlign = TableCell({
      align: "justify",
      children: "x",
    },) as VNode<
      { class?: string }
    >;
    assertEquals(unknownAlign.props.class, undefined,);

    const body = TableCell({ children: "3", },) as VNode<{
      class?: string;
    }>;
    assertEquals(body.type, "td",);
    assert(!(body.props.class ?? "").includes("primary-container",),);

    const row = TableRow({ children: "cells", },) as VNode<
      Record<string, never>
    >;
    assertEquals(row.type, "tr",);
  });

  it("marks missing islands with data-island-missing", () => {
    const islandNode: WireIsland = {
      t: "i",
      n: "NonExistentIsland",
      p: { test: true, },
      c: [],
    };

    const vnode = wireToVNode(islandNode, { islands: {}, },) as VNode<
      Record<string, string>
    >;
    assert(vnode !== null,);
    assertEquals(vnode.props["data-island"], "NonExistentIsland",);
    assertEquals(vnode.props["data-island-missing"], "true",);
  });

  it("leaves island containers empty for selective hydration", () => {
    const islandNode: WireIsland = {
      t: "i",
      n: "CounterLazy.js",
      p: { start: 7, },
      c: [],
    };

    // Even with the module already cached (hydrated before), the main tree does
    // not take ownership of the container: two owners in the same slot would
    // duplicate the widget.
    dynamicIslandsCache["CounterLazy.js"] = function CounterLazy() {
      return null;
    };
    try {
      const vnode = wireToVNode(islandNode,) as VNode<
        Record<string, string | null>
      >;
      assertEquals(vnode.props["data-island"], "CounterLazy.js",);
      assertEquals(vnode.props["data-island-prerendered"], undefined,);
      assertEquals(vnode.props["data-island-missing"], undefined,);
      assertEquals(vnode.props.children, null,);
    } finally {
      delete dynamicIslandsCache["CounterLazy.js"];
    }
  });

  it("marks pre-rendered islands as owned by the main tree", () => {
    const islandNode: WireIsland = {
      t: "i",
      n: "CounterStatic.js",
      p: { start: 7, },
      c: [],
    };

    const vnode = wireToVNode(islandNode, {
      islands: {
        "CounterStatic.js": function CounterStatic() {
          return null;
        },
      },
    },) as VNode<Record<string, string | null>>;

    assertEquals(vnode.props["data-island-prerendered"], "true",);
    assertEquals(vnode.props["data-island-missing"], undefined,);
    assert(vnode.props.children != null,);
  });
});

```

---

## File: `packages/mdblog/tests/router_test.ts`

```ts
import {
  assertEquals,
  assertRejects,
  assertStringIncludes,
} from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import {
  CLIENT_CACHE_NAME,
  NAVIGATION_TIMEOUT_MS,
  withTimeout,
} from "../src/router.ts";
import { APP_VERSION, } from "../src/version.ts";

describe("Navigation budget", () => {
  it("hands the answer of work that settles in time straight through", async () => {
    const doc = await withTimeout(
      new Promise<string>((resolve,) => setTimeout(() => resolve("wire",), 5,)),
      500,
      "guide.md",
    );

    assertEquals(doc, "wire",);
  });

  it("gives up on work that never answers, naming the route it waited for", async () => {
    const never = new Promise<never>(() => {},);

    const error = await assertRejects(
      () => withTimeout(never, 1_500, "./articles/guide.md",),
      Error,
      "did not answer",
    );

    assertStringIncludes(error.message, "./articles/guide.md",);
  });

  it("keeps the original failure when the work rejects first", async () => {
    const error = await assertRejects(
      () =>
        withTimeout(
          Promise.reject(new Error("404: not found",),),
          NAVIGATION_TIMEOUT_MS,
          "missing.md",
        ),
      Error,
      "404: not found",
    );

    assertStringIncludes(error.message, "404",);
  });

  it("sets a budget nobody is asked to wait out, long enough for a cold host", () => {
    // Below five seconds a slow cold start on GitHub Pages is reported as a
    // failure it never was; above half a minute the reader has closed the tab.
    assertEquals(NAVIGATION_TIMEOUT_MS >= 5_000, true,);
    assertEquals(NAVIGATION_TIMEOUT_MS <= 30_000, true,);
  });
});

describe("Client cache bucket naming", () => {
  it("follows the build stamp, mirroring the worker's own bucket scheme", () => {
    // Page and worker share one versioned bucket whenever they come from the
    // same build; a frozen name (the former "mdblog-pwa-v1") accumulated
    // entries no cleanup ever owned.
    assertEquals(
      CLIENT_CACHE_NAME,
      `mdblog-pwa-${APP_VERSION || "dev"}`,
    );
    const swSource = Deno.readTextFileSync(
      new URL("../public/sw.js", import.meta.url,),
    );
    assertEquals(
      swSource.includes(
        'const CACHE_NAME = `mdblog-pwa-${mdTranspiler.version || "dev"}`;',
      ),
      true,
      "sw.js must keep naming its cache with the same template",
    );
  });
});

```

---

## File: `packages/mdblog/tests/shell_test.ts`

```ts
import { assert, assertEquals, assertStringIncludes, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { defaultShell, injectWireShell, } from "../src/plugin/core/shell.ts";
import { processMarkdown, } from "../src/plugin/core/pipeline.ts";

const TEMPLATE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>mdBlog</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.css" />
    <script>/* the deadline that reports a mount that never happened */</script>
  </head>
  <body class="auto">
    <div id="app"></div>
    <script type="module" src="./mdblog.js"></script>
  </body>
</html>`;

const doc = processMarkdown(
  "# Getting Started\n\nThe body.",
  "/articles/getting-started.md",
);

function count(source: string, needle: string,): number {
  return source.split(needle,).length - 1;
}

function beerRelease(source: string,): string | undefined {
  return source.match(/beercss@(\d+\.\d+\.\d+)/,)?.[1];
}

function payloadOf(html: string,): string {
  return html.match(
    /<script id="__md_wire" type="application\/json">([\s\S]*?)<\/script>/,
  )?.[1] ?? "";
}

describe("First-paint shell", () => {
  it("embeds the payload in the head without touching anything else the document asked for", () => {
    const html = injectWireShell(TEMPLATE, doc,);

    assert(html.indexOf("__md_wire",) < html.indexOf("</head>",),);
    assert(html.includes("beercss@3.7.12",), "the stylesheets must survive",);
    assert(
      html.includes(`<script type="module" src="./mdblog.js"></script>`,),
      "the bundle tag must survive",
    );
    assert(
      html.includes("the deadline that reports a mount",),
      "the scripts the application ships are the reason the payload is injected here",
    );
    assertEquals(JSON.parse(payloadOf(html,),), doc,);
  });

  it("titles the document after the article it renders", () => {
    const html = injectWireShell(TEMPLATE, doc,);

    assertStringIncludes(html, "<title>Getting Started - mdBlog</title>",);
  });

  it("replaces a payload the template already carries instead of shipping two", () => {
    const withPlaceholder = TEMPLATE.replace(
      "</head>",
      '    <script id="__md_wire" type="application/json">{"stale":true}</script>\n  </head>',
    );

    const html = injectWireShell(withPlaceholder, doc,);

    assertEquals(count(html, "__md_wire",), 1,);
    assertEquals(payloadOf(html,) === JSON.stringify(doc,), true,);
  });

  it("escapes a title that would otherwise close the payload early", () => {
    const hostile = processMarkdown(
      "# </script><script>alert(1)</script>\n\nBody.",
      "/x.md",
    );

    const html = injectWireShell(TEMPLATE, hostile,);

    // One closing tag for each script the template asked for, plus the payload's
    // own: anything more means the JSON wrote markup into the document.
    assertEquals(count(html, "</script>",), count(TEMPLATE, "</script>",) + 1,);
    assertEquals(JSON.parse(payloadOf(html,),), hostile,);
  });

  it("answers with a document when the template has no head at all", () => {
    const html = injectWireShell(
      '<html><body><div id="app"></div></body></html>',
      doc,
    );

    assert(html.includes("__md_wire",),);
  });

  it("keeps the fallback document on the release the application is built for", async () => {
    const shipped = await Deno.readTextFile(
      new URL("../public/index.html", import.meta.url,),
    );

    assertEquals(beerRelease(defaultShell(doc,),), beerRelease(shipped,),);
    assertEquals(
      defaultShell(doc,).includes("AiStudio",),
      false,
      "the fallback must not carry another project's name",
    );
  });

  it("preloads the icon font in both shells", async () => {
    const shipped = await Deno.readTextFile(
      new URL("../public/index.html", import.meta.url,),
    );

    // beer.min.css declares its @font-face with font-display: block, so a head
    // that does not preload the woff2 keeps every glyph invisible until the
    // font arrives behind the stylesheet — and the fallback shell is read
    // exactly when the network is already failing.
    const fontOf = (html: string,) =>
      html.match(/beercss@[\d.]+\/dist\/cdn\/material-symbols-outlined\.woff2/,)
        ?.[0];

    assert(
      fontOf(shipped,),
      "the shipped index.html must preload the icon font",
    );
    assertEquals(fontOf(defaultShell(doc,),), fontOf(shipped,),);
  });
});

```

---

## File: `packages/mdblog/tests/sw_adapter_test.ts`

```ts
import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import type { IO, } from "../src/plugin/types.ts";
import { toBaseRelativePath, } from "../src/plugin/detect.ts";
import { createSWFetchHandler, } from "../src/plugin/adapters/sw.ts";

/** An IO that answers every document with the same markdown and records the
 * paths it was asked for, which is exactly what these tests are about. */
function recordingIO(markdown: string,): {
  io: IO;
  requested: string[];
} {
  const requested: string[] = [];
  const io: IO = {
    readText(url: string,): Promise<string> {
      requested.push(url,);
      return Promise.resolve(markdown,);
    },
    cacheGet(): Promise<string | null> {
      return Promise.resolve(null,);
    },
    cachePut(): Promise<void> {
      return Promise.resolve();
    },
    cacheDelete(): Promise<void> {
      return Promise.resolve();
    },
  };
  return { io, requested, };
}

/** The part of a fetch event the adapter uses, shaped like the browser's. */
interface ProbeFetchEvent {
  request: Request;
  respondWith(response: Response | Promise<Response>,): void;
}

/** A fetch event whose answer can be awaited. */
function fetchEvent(
  url: string,
  accept: string,
): { event: ProbeFetchEvent; answer: () => Promise<Response> } {
  let replied: Response | Promise<Response> | null = null;
  const event: ProbeFetchEvent = {
    request: new Request(url, { headers: { Accept: accept, }, },),
    respondWith(response: Response | Promise<Response>,) {
      replied = response;
    },
  };
  return {
    event,
    answer: async (): Promise<Response> => {
      if (replied === null) {
        throw new Error(`the handler did not answer ${url}`,);
      }
      return await Promise.resolve(replied,);
    },
  };
}

describe("Document path resolution", () => {
  it("reduces an origin-rooted request to the application's own directory", () => {
    // A site published under /mdBlog/ is asked for /mdBlog/articles/index.md,
    // and the reader resolves paths against that same directory: keeping the
    // prefix would ask for the folder twice and miss every document.
    assertEquals(
      toBaseRelativePath("/mdBlog/articles/index.md", "/mdBlog/",),
      "articles/index.md",
    );
    assertEquals(
      toBaseRelativePath("/mdBlog/docs/guide.md", "/mdBlog/",),
      "docs/guide.md",
    );
  });

  it("leaves a path served at the root of a domain relative to that root", () => {
    assertEquals(
      toBaseRelativePath("/articles/guide.md", "/",),
      "articles/guide.md",
    );
  });

  it("settles the spellings already relative to the application", () => {
    assertEquals(
      toBaseRelativePath("./articles/guide.md", "/mdBlog/",),
      "articles/guide.md",
    );
    assertEquals(
      toBaseRelativePath("articles/guide.md", "/mdBlog/",),
      "articles/guide.md",
    );
    assertEquals(toBaseRelativePath("", "/mdBlog/",), "",);
  });

  it("accepts a base written with or without its trailing slash", () => {
    assertEquals(
      toBaseRelativePath("/mdBlog/articles/index.md", "/mdBlog",),
      "articles/index.md",
    );
  });
});

describe("Service Worker fetch adapter", () => {
  const MARKDOWN = "# Home\n\nThe first article.";

  it("asks the reader for the document below the application directory", async () => {
    const { io, requested, } = recordingIO(MARKDOWN,);
    const handler = createSWFetchHandler(io, { basePath: "./articles", },);

    const { event, answer, } = fetchEvent(
      "https://example.com/articles/index.md",
      "application/json",
    );
    const handled = handler(event,);
    const response = await answer();

    assert(handled, "an article request must be intercepted,",);
    assertEquals(requested, ["articles/index.md",],);
    assert(
      !requested[0]?.startsWith("/",),
      "a path handed to the reader must not be origin-rooted: it resolves against the application directory, so a leading slash is paid for twice under a subfolder deployment",
    );
    assertEquals(response.status, 200,);
    assertEquals(
      (await response.json()).title,
      "Home",
    );
  });

  it("answers a browser navigation with the document and its payload", async () => {
    const { io, } = recordingIO(MARKDOWN,);
    const handler = createSWFetchHandler(io, { basePath: "./articles", },);

    const { event, answer, } = fetchEvent(
      "https://example.com/articles/index.md",
      "text/html",
    );
    handler(event,);
    const response = await answer();

    assertEquals(response.status, 200,);
    assert(
      (response.headers.get("content-type",) ?? "").includes("text/html",),
      "a navigation must be answered with a document, not with the wire alone",
    );
    assert(
      (await response.text()).includes("__md_wire",),
      "the first paint carries the pre-rendered wire payload",
    );
  });

  it("passes raw markdown and everything that is not a document through", () => {
    const { io, requested, } = recordingIO(MARKDOWN,);
    const handler = createSWFetchHandler(io, { basePath: "./articles", },);

    // The reader asks for the markdown with _md_raw=1; answering that would make
    // the worker intercept its own request forever.
    const rawEvent = fetchEvent(
      "https://example.com/articles/index.md?_md_raw=1",
      "text/plain",
    ).event;
    assert(
      !handler(rawEvent,),
      "a raw markdown request must reach the network",
    );
    const assetEvent = fetchEvent(
      "https://example.com/manifest.json",
      "application/json",
    ).event;
    assert(
      !handler(assetEvent,),
      "a static asset is not a document",
    );
    assertEquals(requested, [],);
  });
});

describe("Bounded answers", () => {
  /** An IO whose reads never settle — the wedged-fetch signature. */
  function stalledIO(): IO {
    return {
      readText: (): Promise<string> => new Promise<string>(() => {},),
      cacheGet: (): Promise<string | null> =>
        new Promise<string | null>(() => {},),
      cachePut: (): Promise<void> => Promise.resolve(),
      cacheDelete: (): Promise<void> => Promise.resolve(),
    };
  }

  it("ends a never-settling navigation with a 504 page instead of a spinning tab", async () => {
    const handler = createSWFetchHandler(stalledIO(), {
      basePath: "./articles",
      handlerTimeoutMs: 30,
    },);

    const { event, answer, } = fetchEvent(
      "https://example.com/articles/index.md",
      "text/html",
    );
    assert(handler(event,),);

    const response = await answer();
    assertEquals(response.status, 504,);
    assert(
      (response.headers.get("Content-Type",) ?? "").includes("text/html",),
      "a navigation must be answered with a document, not with JSON",
    );
    assert((await response.text()).includes("Still loading",),);
  });

  it("ends a never-settling JSON request with a JSON error", async () => {
    const handler = createSWFetchHandler(stalledIO(), {
      basePath: "./articles",
      handlerTimeoutMs: 30,
    },);

    const { event, answer, } = fetchEvent(
      "https://example.com/articles/index.md",
      "application/json",
    );
    assert(handler(event,),);

    const response = await answer();
    assertEquals(response.status, 504,);
    const body = JSON.parse(await response.text(),) as { error?: string };
    assert(body.error?.includes("did not answer in time",),);
  });

  it("answers a settling chain immediately and leaves no deadline behind", async () => {
    const { io, } = recordingIO("# Home\n\nBody.",);
    const handler = createSWFetchHandler(io, {
      basePath: "./articles",
      handlerTimeoutMs: 60000,
    },);

    const { event, answer, } = fetchEvent(
      "https://example.com/articles/index.md",
      "application/json",
    );
    assert(handler(event,),);

    // A one-minute deadline could only be observed as a test that never
    // finishes if the fast answer did not clear it.
    const response = await answer();
    assertEquals(response.status, 200,);
  });
});

```

---

## File: `packages/mdblog/tests/theme_toggle_test.ts`

```ts
import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import {
  initialThemeIsDark,
  syncThemeColor,
} from "../src/components/ThemeToggle.ts";

/**
 * The helpers are exercised against hand stubs rather than a DOM shim: they are
 * the only part of the toggle that touches the document, and they read it in
 * exactly one way each (a class list, a media query, a computed color), so a
 * fake that answers those three questions tests the real behavior.
 */

type FakeElement = {
  tagName: string;
  attributes: Record<string, string>;
  setAttribute: (name: string, value: string,) => void;
};

function fakeElement(tagName: string,): FakeElement {
  const el: FakeElement = {
    tagName,
    attributes: {},
    setAttribute: (name: string, value: string,) => {
      el.attributes[name] = value;
    },
  };
  return el;
}

const globals = globalThis as unknown as Record<string, unknown>;

// The key ThemeToggle writes. localStorage exists natively under Deno and its
// global accessor ignores reassignment, so the stub stores the real thing
// instead of replacing it.
const STORAGE_KEY = "mdblog-theme";

interface DomStub {
  /** @description Saved theme value answered by the fake localStorage. */
  saved?: string | null;
  /** @description Classes present on the fake body. */
  bodyClasses?: string[];
  /** @description Whether the fake OS prefers dark. */
  mediaDark?: boolean;
  /** @description Computed background color of the fake body. */
  background?: string;
  /** @description Meta element found by querySelector (null: no meta). */
  meta?: FakeElement | null;
}

/** Installs the stubs for one test and restores the bare globals after. */
function withDom<T,>(
  stub: DomStub,
  body: (dom: { themeMeta: () => FakeElement | null },) => T,
): T {
  const previous: Record<string, unknown> = {};
  const keys = ["document", "getComputedStyle", "matchMedia",];
  for (const key of keys) previous[key] = globals[key];

  let meta = stub.meta === undefined ? fakeElement("meta",) : stub.meta;

  if (stub.saved) localStorage.setItem(STORAGE_KEY, stub.saved,);
  else localStorage.removeItem(STORAGE_KEY,);
  globals.document = {
    body: {
      classList: {
        contains: (name: string,) => (stub.bodyClasses ?? []).includes(name,),
      },
    },
    head: {
      appendChild: (el: FakeElement,) => {
        if (el.tagName === "meta" && !meta) meta = el;
      },
    },
    createElement: (tag: string,) => fakeElement(tag,),
    querySelector: (selector: string,) =>
      selector === 'meta[name="theme-color"]' ? meta : null,
  };
  globals.getComputedStyle = () => ({
    backgroundColor: stub.background ?? "rgb(255, 255, 255)",
  });
  globals.matchMedia = (query: string,) => ({
    matches: query === "(prefers-color-scheme: dark)" &&
      (stub.mediaDark ?? false),
  });

  try {
    return body({ themeMeta: () => meta ?? null, },);
  } finally {
    localStorage.removeItem(STORAGE_KEY,);
    for (const key of keys) {
      if (previous[key] === undefined) delete globals[key];
      else globals[key] = previous[key];
    }
  }
}

describe("ThemeToggle initial state", () => {
  it("lets a saved choice beat the class list and the OS", () => {
    withDom(
      { saved: "dark", mediaDark: false, bodyClasses: ["light",], },
      () => {
        assertEquals(initialThemeIsDark(), true,);
      },
    );
    withDom({ saved: "light", mediaDark: true, }, () => {
      assertEquals(initialThemeIsDark(), false,);
    },);
  });

  it("reads an explicit body class in auto mode", () => {
    withDom({ bodyClasses: ["dark",], mediaDark: false, }, () => {
      assertEquals(initialThemeIsDark(), true,);
    },);
  });

  it("falls back to the OS preference when nothing was saved", () => {
    // The point of the fix: with body class "auto" no class is ever written,
    // yet the page IS dark — the toggle must not offer dark mode on top of it.
    withDom({ mediaDark: true, bodyClasses: ["auto",], }, () => {
      assertEquals(initialThemeIsDark(), true,);
    },);
    withDom({ mediaDark: false, }, () => {
      assertEquals(initialThemeIsDark(), false,);
    },);
  });
});

describe("ThemeToggle theme-color sync", () => {
  it("mirrors the painted body background into the meta", () => {
    withDom({ background: "rgb(18, 18, 18)", }, ({ themeMeta, },) => {
      syncThemeColor();
      assertEquals(themeMeta()?.attributes.content, "rgb(18, 18, 18)",);
    },);
  });

  it("creates the meta when the document ships none", () => {
    withDom({ background: "rgb(250, 250, 250)", meta: null, }, ({
      themeMeta,
    },) => {
      syncThemeColor();
      assertEquals(themeMeta()?.attributes.content, "rgb(250, 250, 250)",);
    },);
  });

  it("leaves the shipped color alone over an unpainted background", () => {
    const meta = fakeElement("meta",);
    meta.attributes.content = "#6750a4";
    withDom({ background: "rgba(0, 0, 0, 0)", meta, }, () => {
      syncThemeColor();
      assertEquals(meta.attributes.content, "#6750a4",);
    },);
  });

  it("does not throw when the document is missing entirely", () => {
    delete globals.document;
    syncThemeColor();
    assert(true,);
  });
});

```

---

## File: `packages/mdblog/tests/utils_test.ts`

```ts
import { assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import {
  articleHrefFromPath,
  estimateReadingTimeMinutes,
  extractTocHeadings,
  findAdjacentArticles,
  normalizePath,
  tocRailHeight,
} from "../src/utils.ts";
import type { ArticleItem, } from "../src/state.ts";
import type { WireFragment, } from "../src/plugin/wire.ts";

describe("normalizePath", () => {
  it("normalizes hash routes with articles prefix", () => {
    assertEquals(normalizePath("#/articles/intro.md",), "intro.md",);
  });

  it("normalizes relative paths with docs prefix", () => {
    assertEquals(normalizePath("./docs/guide.md",), "guide.md",);
  });

  it("normalizes plain relative paths", () => {
    assertEquals(normalizePath("./articles/overview.md",), "overview.md",);
  });

  it("falls back to index.md for empty or root variants", () => {
    assertEquals(normalizePath("",), "index.md",);
    assertEquals(normalizePath("#/",), "index.md",);
    assertEquals(normalizePath("index",), "index.md",);
  });
});

describe("articleHrefFromPath", () => {
  it("builds root hash for the home page", () => {
    assertEquals(articleHrefFromPath("./articles/index.md",), "#/",);
  });

  it("builds hash route for regular articles", () => {
    assertEquals(articleHrefFromPath("./articles/intro.md",), "#/intro.md",);
  });
});

describe("extractTocHeadings", () => {
  const wire: WireFragment = {
    t: "f",
    c: [
      { t: "c", n: "Heading", p: { depth: 1, id: "title", }, c: ["Title",], },
      {
        t: "c",
        n: "Heading",
        p: { depth: 2, id: "intro", },
        c: ["Intro ", { t: "e", n: "strong", c: ["Bold",], },],
      },
      { t: "c", n: "Paragraph", c: ["text",], },
      {
        t: "c",
        n: "Heading",
        p: { depth: 3, id: "details", },
        c: ["Details",],
      },
      {
        t: "c",
        n: "Heading",
        p: { depth: 4, id: "deep", },
        c: ["Too deep",],
      },
    ],
  };

  it("collects only h2..h3 headings with ids in document order", () => {
    const toc = extractTocHeadings(wire,);
    assertEquals(toc, [
      { id: "intro", text: "Intro Bold", depth: 2, },
      { id: "details", text: "Details", depth: 3, },
    ],);
  });

  it("returns empty list when no headings match", () => {
    assertEquals(extractTocHeadings({ t: "f", c: ["plain",], },), [],);
  });
});

describe("estimateReadingTimeMinutes", () => {
  it("rounds word count to whole minutes", () => {
    const text = "word ".repeat(400,);
    assertEquals(estimateReadingTimeMinutes(text,), 2,);
  });

  it("returns at least one minute for short documents", () => {
    assertEquals(estimateReadingTimeMinutes("short doc",), 1,);
  });

  it("ignores frontmatter blocks", () => {
    const doc = "---\ntitle: Test\n---\n" + "word ".repeat(200,);
    assertEquals(estimateReadingTimeMinutes(doc,), 1,);
  });
});

describe("findAdjacentArticles", () => {
  const list: ArticleItem[] = ["index.md", "a.md", "b.md",].map((name,) => ({
    name,
    slug: name.replace(/\.md$/, "",),
    path: `./articles/${name}`,
    title: name,
    icon: "article",
    depth: 0,
  }));

  it("returns null prev at the first article", () => {
    const { prev, next, } = findAdjacentArticles(list, "#/articles/index.md",);
    assertEquals(prev, null,);
    assertEquals(next?.name, "a.md",);
  });

  it("returns both neighbors for middle articles", () => {
    const { prev, next, } = findAdjacentArticles(list, "./articles/a.md",);
    assertEquals(prev?.name, "index.md",);
    assertEquals(next?.name, "b.md",);
  });

  it("returns null next at the last article", () => {
    const { prev, next, } = findAdjacentArticles(list, "b.md",);
    assertEquals(prev?.name, "a.md",);
    assertEquals(next, null,);
  });

  it("returns nulls when the path is unknown", () => {
    const { prev, next, } = findAdjacentArticles(list, "missing.md",);
    assertEquals(prev, null,);
    assertEquals(next, null,);
  });
});

describe("tocRailHeight", () => {
  it("grows the box with the screen instead of with the entry count", () => {
    assertEquals(tocRailHeight(900,).heightClass, "large-height",);
    assertEquals(tocRailHeight(600,).heightClass, "medium-height",);
    assertEquals(tocRailHeight(400,).heightClass, "small-height",);
  });

  it("reports the pixel height each class sets", () => {
    assertEquals(tocRailHeight(900,).maxHeightPx, 576,);
    assertEquals(tocRailHeight(600,).maxHeightPx, 384,);
    assertEquals(tocRailHeight(400,).maxHeightPx, 192,);
  });

  it("falls back to the shortest box on tiny viewports", () => {
    assertEquals(tocRailHeight(0,).heightClass, "small-height",);
    assertEquals(tocRailHeight(0,).maxHeightPx, 192,);
  });
});

```

---


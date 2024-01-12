import GlobalStateUtility from "@/global/global";
import { deConvertion, enConvertion, FileType, PluginConfigType } from "@/types";
import {  isFileExists } from "@/utils/file";
const getAllExamples = ()=>{
  const global  = GlobalStateUtility.getInstance();
  const examples =  global.getPluginAppEntryConfig().next;
 const allExample =  examples.map((example)=>{return ({exampleName:example.Layout.exampleName,examplePath:example.Layout.examplePath})});
 return allExample;
}
const getGlobalCssContent = ()=>{
  const isTailwind = isFileExists(process.cwd(), "tailwind.config.ts");
  if(isTailwind){
    return globalTailwindStyle;
  }else{
    return globalCustomStyle
  }
}
//dictionaries/de.json

const i18nDeDictionary =()=>
{
  const object = JSON.stringify(deConvertion).slice(1,-1).trim();
return `{
  "navigation": {
    "home": "Startseite",
    "about": "Über",
    ${object}
  },
  "page": {
    "home": {
      "title": "Willkommen bei NextJs i18n",
      "description": "Internationalisierung im NextJs 13 App-Router"
    },
    "about": {
      "title": "Über uns",
      "description": "Dies ist die About-Seite"
    }
  }
}
`;}

//dictionaries/en.json
const i18nEnDictionary =() => {
  const object = JSON.stringify(enConvertion).slice(1,-1).trim();
  return `{
  "navigation": {
    "home": "Home",
    "about": "About",
    ${object}
  },
  "page": {
    "home": {
      "title": "Welcome to NextJs i18n",
      "description": "Internationalization in NextJs 13 App router"
    },
    "about": {
      "title": "About Us",
      "description": "This is the about page"
    }
  }
}
`;}

//lib/dictionary.ts
const i18DictionaryConfig = (isTsProject: boolean) => `import "server-only";
${isTsProject ? `import type { Locale } from "@/i18n.config";` : ""}
export const getDictionary = async (locale${isTsProject ? ": Locale" : ""}) => {
  let data;
  switch (locale) {
    case "de":
      data = await import("@/dictionaries/de.json").then(
        module => module.default
      );
      break;
    case "en":
      data = await import("@/dictionaries/en.json").then(
        module => module.default
      );
      break;
    default:
      data = await import("@/dictionaries/en.json").then(
        module => module.default
      );
      break;
  }

  return data;
};
`;

//i18n.config.ts
const i18nConfig = (isTsProject: boolean) => `export const i18n = {
  defaultLocale: "en",
  locales: ["en", "de"],
}${isTsProject ? " as const" : ""};
${isTsProject ? `export type Locale = (typeof i18n)["locales"][number];` : ""}
`;

//middleware.ts
const nextMiddlewareConfig = (isTsProject: boolean) =>


  `import { NextResponse } from "next/server";${
    isTsProject ? `\nimport type { NextRequest } from "next/server";` : ""
  }
  import { i18n } from "@/i18n.config";
  import { match as matchLocale } from "@formatjs/intl-localematcher";
  import Negotiator from "negotiator";
  
  function getLocale(request${isTsProject ? ": NextRequest" : ""})${
    isTsProject ? ": string | undefined " : ""
  }{
    const negotiatorHeaders${isTsProject ? ": Record<string, string>" : ""} = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
    
    // @ts-ignore locales are readonly
    const locales${isTsProject ? ": string[]" : ""} = i18n.locales;
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
    
    const locale = matchLocale(languages, locales, i18n.defaultLocale);
  return locale;
}

export function middleware(request${isTsProject ? ": NextRequest" : ""}) {
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = i18n.locales.every(
    locale => !pathname.startsWith(+=+/$\{locale}/+=+) && pathname !== +=+/\${locale}+=+
    );
    
    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
      const locale = getLocale(request);
      return NextResponse.redirect(
        new URL(
          +=+/\${locale}\${pathname.startsWith("/") ? "" : "/"}\${pathname}+=+,
          request.url
          )
          );
        }
      }
      
      export const config = {
        // Matcher ignoring "/_next/" and "/api/"
        matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
      };
      `
      .replaceAll(/\\/g, "")
      .replaceAll("+=+", "`")
    
      
//components/header.tsx
const nextHeaderComponent = (isTsProject: boolean) =>{

 const allExample = getAllExamples();
  return `import Link from "next/link";${
    isTsProject ? `\nimport { Locale } from "@/i18n.config";` : ""
  }
import { getDictionary } from "@/lib/dictionary";
import LocaleSwitcher from "./locale-switcher";
export default async function Header({ lang }${
    isTsProject ? ": { lang: Locale }" : ""
  }) {
  const { navigation } = await getDictionary(lang);

  return (
    <header className="py-6">
    
      <nav className="container flex items-center justify-between">
        <ul className="flex gap-x-8 list-none">
        <li>
        <Link className="text-black no-underline" href={+=+/\${lang}/+=+}>{navigation.home}</Link>
      </li>
          <li>
            <Link className="text-black no-underline" href={+=+/\${lang}/about+=+}>{navigation.about}</Link>
          </li>
          ${allExample.map((example)=>{
            return` <li>
            <Link className="text-black no-underline" href={+=+/\${lang}/${example.examplePath}+=+}>{navigation["${example.exampleName}"]}</Link>
          </li>`
          }).join("")}
        </ul>
        <LocaleSwitcher />
      </nav>
    </header>
  );}
  `
    .replaceAll(/\\/g, "")
    .replaceAll("+=+", "`");

}


  
//components/locale-switcher.tsx
const nextLocaleSwitcherComponent = (isTsProject: boolean) => {
 

  return`

   ${ `"use client";
  
  import Link from "next/link";
  import { usePathname } from "next/navigation";
  
  import { i18n } from "@/i18n.config";
  
  export default function LocaleSwitcher() {
    const pathName = usePathname();
    
  const redirectedPathName = (locale${isTsProject ? ": string" : ""}) => {
    if (!pathName) return "/";
    const segments = pathName.split("/");
    segments[1] = locale;
    return segments.join("/");
  };
  
  return (
    <ul className="flex gap-x-3 list-none">
    {i18n.locales.map(locale => {
      return (
        <li key={locale}>
        <Link
        href={redirectedPathName(locale)}
        className="rounded-md border bg-black px-3 py-2 text-white"
        >
        {locale}
        </Link>
        </li>
        );
      })}
      </ul>
      );
    }
    `}`
    ;
    
    // root page in app dir
  }
const nextRootPageComponent = (isTsProject: boolean) => {

  return `${
  isTsProject ? `import { Locale } from "@/i18n.config";\n` : ""
}import { getDictionary } from "@/lib/dictionary";

export default async function Home({
  params: { lang },
}${
  isTsProject
    ? `: {
  params: { lang: Locale };
}`
    : ""
}) {
  const { page } = await getDictionary(lang);

  return (
    <section className="py-24">
    <div className="container">
    <h1 className="text-3xl font-bold">{page.home.title}</h1>
    <p className="text-gray-500">{page.home.description}</p>
    </div>
    </section>
    );
  }
  `;}
  
  // about/page.tsx in app dir
  const nextAboutPageComponent = (isTsProject: boolean) => {
    
    
   
    return `${

  isTsProject ? `import { Locale } from "@/i18n.config";\n` : ""
}import { getDictionary } from "@/lib/dictionary";

export default async function About({
  params: { lang },
}${
  isTsProject
    ? `: {
  params: { lang: Locale };
}`
    : ""
}) {
  const { page } = await getDictionary(lang);

  return (
    <section className="py-24">
      <div className="container">
        <h1 className="text-3xl font-bold">{page.about.title}</h1>
        <p className="text-gray-500">{page.about.description}</p>
      </div>
    </section>
  );
}
`};

const globalTailwindStyle = `@tailwind base;
@tailwind components;
@tailwind utilities;
* {
  padding: 0 0.5rem;
}`;
const globalCustomStyle = `.container {
  width: 80vw;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}
.py-6 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.gap-x-8 {
  column-gap: 2rem;
}
.gap-x-3 {
  column-gap: 1.75rem;
}
.rounded-md {
  border-radius: 0.375rem;
}

.border {
  border-width: 1px;
  border-style: solid;
}
.text-black {
  color: #000;
}
.py-24 {
  padding: 6rem, 1.5rem;
}
.bg-black {
  background-color: #000;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.text-white {
  color: #fff;
}
.text-3xl {
  font-size: 1.875rem;
}

.font-bold {
  font-weight: bold;
}
.text-gray-500 {
  color: #718096;
}
.list-none {
  list-style-type: none;
}
.no-underline {
  text-decoration: none;
}
.rounded-md {
  border-radius: 0.375rem;
}

.border {
  border: 1px solid;
}

.bg-black {
  background-color: #000;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.text-white {
  color: #fff;
}
section {
  padding: 0rem 2.5rem;
}


`
const i18nNextPlugin: PluginConfigType = {
  initializingMessage: "Adding i18n, Please wait !",
  dependencies: function (isTsProject: boolean) {
    return `negotiator @formatjs/intl-localematcher${
      isTsProject ? " @types/negotiator" : ""
    }`;
  },
  files: [
    {
      content: i18nDeDictionary,
      fileName: "de.json",
      fileType: FileType.SIMPLE,
      path: ["src", "dictionaries"],
    },
    {
      content: i18nEnDictionary,
      fileName: "en.json",
      fileType: FileType.SIMPLE,
      path: ["src", "dictionaries"],
    },
    {
      content: getGlobalCssContent,
      fileName: "globals.css",
      fileType: FileType.SIMPLE,
      path: ["src", "app"],
    },
    {
      content: i18DictionaryConfig,
      fileName: "dictionary",
      fileType: FileType.NATIVE,
      path: ["src", "lib"],
    },
    {
      content: i18nConfig,
      fileName: "i18n.config",
      fileType: FileType.NATIVE,
      path: ["src"],
    },
    {
      content: nextMiddlewareConfig,
      fileName: "middleware",
      fileType: FileType.NATIVE,
      path: ["src"],
    },
    {
      content: nextHeaderComponent,
      fileName: "header",
      fileType: FileType.COMPONENT,
      path: ["src", "components"],
    },
    {
      content: nextLocaleSwitcherComponent,
      fileName: "locale-switcher",
      fileType: FileType.COMPONENT,
      path: ["src", "components"],
    },
    {
      content: nextRootPageComponent,
      fileName: "page",
      fileType: FileType.COMPONENT,
      path: ["src", "app"],
    },
    {
      content: nextAboutPageComponent,
      fileName: "page",
      fileType: FileType.COMPONENT,
      path: ["src", "app", "about"],
    },
  ],
  fileModification: {
    Layout: {
      importStatements: `import { Locale, i18n } from "@/i18n.config";
import Header from "@/components/header";`,
      addAfterMatch: "",
      addBeforeMatch: "<Header lang={params.lang} />",
      regex: /{children}/,
      examplePath:"/ii8n",
      exampleName:"ii8n Example"
    },
    Page: {},
  },
  successMessage: "Successfully added i18n with language routes !",
};
export default i18nNextPlugin;

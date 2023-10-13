import { PluginConfigType } from "@/types";

//dictionaries/de.json
const i18nDeDictionary = `{
  "navigation": {
    "home": "Startseite",
    "about": "Über"
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
`;

//dictionaries/en.json
const i18nEnDictionary = `{
  "navigation": {
    "home": "Home",
    "about": "About"
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
`;

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
    .replaceAll("+=+", "`");

//components/header.tsx
const nextHeaderComponent = (isTsProject: boolean) =>
  `import Link from "next/link";${
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
        <ul className="flex gap-x-8">
          <li>
            <Link href={+=+/\${lang}+=+}>{navigation.home}</Link>
          </li>
          <li>
            <Link href={+=+/\${lang}/about+=+}>{navigation.about}</Link>
          </li>
        </ul>
        <LocaleSwitcher />
      </nav>
    </header>
  );
}
`
    .replaceAll(/\\/g, "")
    .replaceAll("+=+", "`");

//components/locale-switcher.tsx
const nextLocaleSwitcherComponent = (isTsProject: boolean) => `"use client";

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
    <ul className="flex gap-x-3">
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
`;

// root page in app dir
const nextRootPageComponent = (isTsProject: boolean) => `${
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
`;

// about/page.tsx in app dir
const nextAboutPageComponent = (isTsProject: boolean) => `${
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
`;

const i18nNextPlugin: PluginConfigType = {
  initializingMessage: "Adding i18n, Please wait !",
  dependencies: function (isTsProject: boolean) {
    return `negotiator @formatjs/intl-localematcher ${
      isTsProject ? "@types/negotiator" : ""
    }`;
  },
  files: [
    {
      content: i18nDeDictionary,
      fileName: "de.json",
      fileType: "simple",
      path: ["src", "dictionaries"],
    },
    {
      content: i18nEnDictionary,
      fileName: "en.json",
      fileType: "simple",
      path: ["src", "dictionaries"],
    },
    {
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
      fileName: "globals.css",
      fileType: "simple",
      path: ["src", "app"],
    },
    {
      content: i18DictionaryConfig,
      fileName: "dictionary",
      fileType: "native",
      path: ["src", "lib"],
    },
    {
      content: i18nConfig,
      fileName: "i18n.config",
      fileType: "native",
      path: ["src"],
    },
    {
      content: nextMiddlewareConfig,
      fileName: "middleware",
      fileType: "native",
      path: ["src"],
    },
    {
      content: nextHeaderComponent,
      fileName: "header",
      fileType: "component",
      path: ["src", "components"],
    },
    {
      content: nextLocaleSwitcherComponent,
      fileName: "locale-switcher",
      fileType: "component",
      path: ["src", "components"],
    },
    {
      content: nextRootPageComponent,
      fileName: "page",
      fileType: "component",
      path: ["src", "app"],
    },
    {
      content: nextAboutPageComponent,
      fileName: "page",
      fileType: "component",
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
    },
    Page: {},
  },
  successMessage: "Successfully added i18n with language routes !",
};

export default i18nNextPlugin;

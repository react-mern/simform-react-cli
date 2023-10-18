import { PluginConfigType } from "@/types";

const i18LanguageReact = `export const languages = [
  {
    code: "en",
    name: "English",
    country_code: "us",
  },
  {
    code: "fr",
    name: "French",
    country_code: "fr",
  },
];
`;

const i18nConfigReact = `import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .use(HttpApi)
  .init({
    // lng: "fr", // if you're using a language detector, do not define the lng option
    supportedLngs: ["en", "fr"],
    fallbackLng: "en",
    detection: {
      order: ["localStorage", "cookie", "htmlTag"],
      caches: ["cookie", "localStorage"],
      lookupCookie: "language",
      lookupLocalStorage: "language",
    },
  });

export default i18n;
`;

const i18nExampleComponentReact = `import i18next from "i18next";
import { useTranslation } from "react-i18next";

function I18Example() {
  const { t } = useTranslation();

  const handleLangChange = () => {
    /**
     * you can below code in Root component to change the application language based on user preference. 
     * const { , i18n } = useTranslation();

       useEffect(() => {
         const lng = navigator.language;
         i18n.changeLanguage(lng);
       }, [i18]);
     */

    const getLanguage = localStorage.getItem("language");
    if (getLanguage === "fr") {
      i18next.changeLanguage("en");
    } else {
      i18next.changeLanguage("fr");
    }
  };

  const lng = navigator.language;

  return (
    <div className="nav">
      <div>Browser language : {lng}</div>
      <h1>{t("hey_how're_you_doing?")}</h1>
      <button onClick={handleLangChange}>Change Language</button>
    </div>
  );
}

export default I18Example;
`;

const i18EnTranslation = `{
  "hey_how're_you_doing?": "hey, how're you doing?"
}
`;

const i18FrTranslation = `{
  "hey_how're_you_doing?": "hé, comment vas-tu ?"
}
`;

const i18NReactPlugin: PluginConfigType = {
  initializingMessage: "Adding i18n, Please wait !",
  dependencies:
    "i18next i18next-browser-languagedetector react-i18next i18next-http-backend",
  files: [
    {
      content: i18LanguageReact,
      fileName: "i18-language",
      fileType: "native",
      path: ["src", "utils"],
    },
    {
      content: i18nConfigReact,
      fileName: "i18n",
      fileType: "native",
      path: ["src", "utils"],
    },
    {
      content: i18nExampleComponentReact,
      fileName: "I18Example",
      fileType: "component",
      path: ["src", "components", "i18Example"],
    },
    {
      content: i18EnTranslation,
      fileName: "translation.json",
      fileType: "simple",
      path: ["public", "locales", "en"],
    },
    {
      content: i18FrTranslation,
      fileName: "translation.json",
      fileType: "simple",
      path: ["public", "locales", "fr"],
    },
  ],
  fileModification: {
    App: {
      importStatement: `import I18Example from "src/components/i18Example/I18Example";`,
      name: "I18n",
      component: "<I18Example />",
    },
    Index: {
      importStatements: `import "src/utils/i18n";`,
      addAfterMatch: "",
      addBeforeMatch: "",
    },
  },
  successMessage: "Successfully added i18n config with example component !",
};
export default i18NReactPlugin;

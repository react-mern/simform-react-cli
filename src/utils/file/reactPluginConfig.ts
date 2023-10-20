export const homePageContent = (
  isTsProject: boolean,
  componentArr: { name: string; component: string }[]
) =>
  `import { useState, ReactNode } from "react";
import styles from "./Home.module.css";

${
  isTsProject
    ? `type ExampleComponent = {
  component: ReactNode;
  name: string;
}[];`
    : ""
}
const Components${isTsProject ? ": ExampleComponent " : ""} = ${JSON.stringify(
    componentArr
  )};

const Home = () => {

  const [example, setExample] = useState${
    isTsProject ? "<ExampleComponent[number]>" : ""
  }({
    component: <></>,
    name: "Please Select",
  });
  
  return (
    <>
      <div className={styles.container}>
        <h1 className={styles["container__heading--size"]}>Welcome to Simform&apos;s Boilerplate</h1>
        <img src="https://ik.imagekit.io/ashishkk22/react.svg" alt="react logo" width={200} />
      </div>
     {Components.length > 0 && (
        <div className={styles.exContainer}>
          <h2 className={styles.exContainer__heading}>Examples</h2>
          <div className={styles.exContainer__main}>
            <div>
              {Components.map((obj) => {
                return (
                  <div key={obj.name} style={{ cursor: "pointer" }}>
                    <div
                      onClick={() => setExample(obj)}
                      className={obj.name === example.name ? styles["exContainer__sidebar--underline"] : ""}
                    >
                      {obj.name}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.exContainer__demo}>
              <div className={styles["exContainer__demo--heading"]}>{example?.name + " Example"} </div>
              <div>{example?.component}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
`.replace(/(["'])(<[^<]+\/>)\1/g, "$2");

export const homePageCss = `.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 5rem;
}

.container__heading--size {
  text-align: center;
  margin: 5rem;
}

.exContainer {
  width: 75%;
  margin: 0 10%;
}

.exContainer__heading {
  margin-bottom: 1rem;
  color: #ea495c;
}

.exContainer__main {
  display: flex;
}

.exContainer__sidebar--underline {
  text-decoration: underline;
  text-decoration-color: #ea495c;
}

.exContainer__demo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.exContainer__demo--heading {
  color: #ea495c;
  margin-bottom: 2rem;
}
`;

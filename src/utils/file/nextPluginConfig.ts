export const nextHomePageContent = (isTsProject:boolean,componentArr:{exampleName:string,examplePath:string}[])=>`
import styles from "./page.module.css";
import Link from "next/link";
export default function Home() {
  const Components = ${JSON.stringify(
    componentArr,
  )};
    return (
      <main className={styles.main}>
      <nav className={styles.navbarContainer}>
        <div>
          <img
            className={styles.logo}
            src="https://ik.imagekit.io/ashishkk22/simform_logo.svg?updatedAt=1697020836220"
            alt="simform_logo"
          />
        </div>
        <div>
          <div>
            <ul className={styles.navbarItems}>
              {Components.map((obj) => {
                return (
                  <li className={styles.navItem}>
                    <Link href={obj.examplePath} className={styles.navItem}>
                      {obj.exampleName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>
      <h1>Welcome to Simform Boiler Plate</h1>
    </main>
    );
  }`.replace(/(["'])(<[^<]+\/>)\1/g, "$2");
export const nextHomeCssContent = ()=>`
.main {
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.navbarContainer {
  background-color: #ea495c;
  padding: 10px 50px;
  width: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.navbarItems {
  list-style-type: none;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 30px;
}
.logo {
  color: red;
}
.navItem {
  color: white;
  text-decoration: none;
}

`
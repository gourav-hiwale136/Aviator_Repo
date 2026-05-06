import React from 'react'
import styles from './header.module.scss';
import PrivyLogin from '../../utilis/PrivyLogin/PrivyLogin';

const Header = () => {
  return (
    <div className={styles.header_main_div}>
        <div className={styles.header}>
          <h1 className={styles.title}>🚀 AVIATOR</h1>
          <p className={styles.subtitle}>SOLAR ODYSSEY</p>
        </div>

        {/* <button className={styles.btn_sign_in}>SignIn</button> */}
        <PrivyLogin/>
    </div>
  )
}

export default Header

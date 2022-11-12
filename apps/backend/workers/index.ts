import db from "../firebase";
import { getStore } from "../cache";

/** This simulates a worker or cronjob that runs every minute
 ** It loops through the cache and stores all note content to db
 */
export function dbWorker() {
    setInterval(() => {
        const store = getStore();
        const batch = db.batch();
    
        //group all note content so you write as batch
        if(store.size) {
            store.forEach((value, key) => {
                const { content } = value;
                let docRef = db.collection("notes").doc(key);
                batch.update(docRef, { content });
            });
        
            //write to db
            batch.commit().then(() => {
                console.log("Note contents written to db");
            })
        }
    
    }, 60000);
}
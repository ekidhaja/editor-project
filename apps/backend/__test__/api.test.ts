import request from "supertest";
import { app } from "../app";

let id: string;
let title: string = "Test note";
let newTitle: string = "Test note updated";

describe("Testing api endpoints", () => {

    describe("giving note name", () => {
        jest.setTimeout(60000);

        it("should create note", async () => {
            const res = await request(app).post("/api/v1/notes/").send({ title });

            expect(res.status).toEqual(200);
            expect(res.body.id).toBeTruthy();

            id = res.body.id;
        });

        it("should get note by id", async () => {
            const res = await request(app).get(`/api/v1/notes/${id}`).send();

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(id);
            expect(res.body.title).toBe(title);
        });

        it("should update note title", async () => {
            await request(app).patch(`/api/v1/notes/${id}`).send({ title: newTitle});
            const res = await request(app).get(`/api/v1/notes/${id}`).send();

            expect(res.body.title).toBe(newTitle);
        });

        it("should delete note", async () => {
            const res = await request(app).delete(`/api/v1/notes/${id}`).send();
            expect(res.status).toBe(200);
        });
    })

})
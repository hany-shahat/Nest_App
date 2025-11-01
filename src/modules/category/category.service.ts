import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryService {
    constructor() { }
    categories() {
        return [{id:2 , name:"hjkk"}]
    }
}

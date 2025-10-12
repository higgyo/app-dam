export default class GeoLocation {
    private constructor(
        readonly latitude: number,
        readonly longitude: number
    ) {}

    static create(latitude: number, longitude: number) {
        return new GeoLocation(latitude, longitude);
    }
}

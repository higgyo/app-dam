export default class GeoLocation {
    private constructor(latitude: number, longitude: number) {}

    static create(latitude: number, longitude: number) {
        return new GeoLocation(latitude, longitude);
    }
}

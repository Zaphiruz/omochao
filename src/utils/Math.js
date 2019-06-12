Math.clamp = Math.clamp || function(v, min, max) {
    return v > max ? max : v < min ? min : v;
}
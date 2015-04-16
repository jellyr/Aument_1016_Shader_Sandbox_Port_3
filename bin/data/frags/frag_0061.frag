// Original: From iq's latest live coding video, "a simple eye ball"
//.this: dolf´s volcano

#ifdef GL_ES
precision highp float;
#endif

uniform vec2 resolution;
uniform float time;

mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

float hash( float n )
{
    return fract(sin(n*8.)*453758.5453);
}

float noise( in vec2 x )
{
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float n = p.x + p.y*57.0;
    float res = mix(mix( hash(n+  0.0), hash(n+  1.0),f.x), mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y);
    return res;
}

float fbm( vec2 p )
{
    float f = 0.0;
    f += 0.50000*noise( p ); p = m*p*4.02;
    f += 0.25000*noise( p ); p = m*p*12.03;
    f += 0.12500*noise( p ); p = m*p*2.01;
    f += 0.06250*noise( p ); p = m*p*2.04;
    f += 0.03125*noise( p );
    return f/0.984375;
}

float length2( vec2 p )
{
    float ax = abs(p.x);
    float ay = abs(p.x);
    return pow( pow(ax,4.0) + pow(ay,4.0), 1.0/4.0 );
}

void main(void)
{
    vec2 q = gl_FragCoord.xy / resolution.xy;
    vec2 p = -1.0 + 2.0 * q;
    p.x *= resolution.x/resolution.y;
    float r = length( p );
    float a = atan( p.y, p.x );
    float dd = 2.2*sin(0.2*time);
    float ss = 1.0 + clamp(1.0-r,0.0,1.0)*dd;
    r *= ss;
    vec3 col = vec3( 0.0, 0.3, 0.4 );
    float f = fbm( 5.0*p );
    col = mix( col, vec3(0.2,0.5,0.4), f );
    col = mix( col, vec3(0.09,0.06,0.2), 2.0-smoothstep(0.1,0.6,r) );
    a += 0.05*fbm( 20.0*p );
    f = smoothstep( 0.3, 1.0, fbm( vec2(20.0*a,6.0*r) ) );
    col = mix( col, vec3(1.0,1.0,1.0), f );
    f = smoothstep( 0.4, 0.9, fbm( vec2(15.0*a,10.0*r) ) );
    col *= 1.0-0.5*f;
    col *= 1.0-0.25*smoothstep( 0.6,0.8,r );
    f = 1.0-smoothstep( 0.0, 0.6, length2( mat2(0.6,0.8,-0.8,0.6)*(p-vec2(0.3,0.5) )*vec2(1.0,2.0)) );
    col += vec3(1.0,0.9,0.9)*f*0.985;
    col *= vec3(0.8+0.2*cos(r*a));
    f = 1.0-smoothstep( 0.2, 0.25, r );
    col = mix( col, vec3(0.0), f*4. );
    f = smoothstep( 0.79, 0.82, r*f );
    col = mix( col, vec3(6.0,1.0,1.0), f );
    gl_FragColor = vec4(col,2.0);
}
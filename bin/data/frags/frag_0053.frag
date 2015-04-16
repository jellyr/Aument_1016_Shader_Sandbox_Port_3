#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main( void ) {
	vec2 position = ( gl_FragCoord.xy / resolution.xy );

	float color = 0.0;

  // sin(sqrt(x^2 + y^2)) / sqrt(x^2 + y^2)
  
  	float ox = resolution.x / 2.0;
  	float oy = resolution.y / 2.0;
  
  	float px = 50.0 - ((position.x) * 100.0);
  	float py = 50.0 - ((position.y) * 100.0);

   	float px2 = 25.0 - ((position.x) * 100.0) + sin(time)*10.0;
  	float py2 = 25.0 - ((position.y) * 100.0) + cos(time)*20.0;
 
  	float d =sqrt (px*px +py*py);
  	float d2 =sqrt (px2*px2 +py2*py2);
  
  	color = sin( d * (d/(155.0+ sin(time)*10.0))+ time*0.0) / (d/8.0);
  	color += sin( d2 * (d2/(155.0 + sin(time)*20.0))) / (d2/8.0);

	float c2 = (color > 0.2 && color< 0.3) ? 0.4 : 0.0;
 
 	if((color > 0.5)){
		color = 1.0;
	}else{
		color = 0.0;
	}
	
  	color += c2;
	
	gl_FragColor = vec4( vec3( color, color, color )  , 1.0 );

}
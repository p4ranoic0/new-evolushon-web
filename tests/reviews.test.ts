import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReviewsSection } from '../src/components/Reviews.js';
import { DEFAULT, clone, migrate } from '../shared/index.js';
import { SAMPLE_REVIEWS } from '../shared/reviews.js';
import { parseSocialComments, importSocialComments } from '../shared/social-reviews.js';
import { siteSchema } from '../shared/schemas.js';
import type { GoogleReviewsState, Review } from '../shared/types.js';

const review:Review={id:'real',author:'@alumna',source:'instagram',url:'https://www.instagram.com/p/original/',date:'2026-10',rating:5,hidden:false,text:{es:'Comentario de prueba de importación',en:'',fr:'',de:''}};
const samples=SAMPLE_REVIEWS.map(r=>({...r,source:'manual' as const,hidden:false,text:{es:r.text.es,en:r.text.en,fr:'',de:''}}));
test('reseñas: seed sin ejemplos y migración compatible con fuente manual por defecto',()=>{
  assert.deepEqual(DEFAULT.reviews,[]);
  const data=clone(DEFAULT);
  data.reviews=[{...review,source:undefined} as unknown as Review];
  assert.equal(migrate(data).reviews[0].source,'manual');
  assert.equal(siteSchema.parse(data).reviews[0].source,'manual');
  assert.equal(siteSchema.safeParse({...data,reviews:[{...review,url:'javascript:alert(1)'}]}).success,false);
});
test('HTML de reseñas: jamás ejemplos ni ocultas, vacío sin Maps se oculta',()=>{
  const html=renderToStaticMarkup(createElement(ReviewsSection,{lang:'es',settings:DEFAULT.settings.reviews,reviews:[...samples,{...review,hidden:true}]}));
  assert.equal(html,'');
  const settings={...DEFAULT.settings.reviews,placeUrl:'https://maps.google.com/?cid=1',rating:4.9,count:14};
  const ratingOnly=renderToStaticMarkup(createElement(ReviewsSection,{lang:'es',settings,reviews:samples}));
  assert.match(ratingOnly,/4.9/);assert.match(ratingOnly,/Ver en Google Maps/);assert.doesNotMatch(ratingOnly,/<article|Camila|Ejemplo/);
});
test('HTML de reseñas: fuente, enlace seguro y títulos en los cuatro idiomas',()=>{
  for(const lang of ['es','en','fr','de'] as const){
    const html=renderToStaticMarkup(createElement(ReviewsSection,{lang,settings:DEFAULT.settings.reviews,reviews:[...samples,review]}));
    assert.match(html,/data-source="instagram"/);assert.match(html,/icon-brand-instagram/);assert.match(html,/href="https:\/\/www.instagram.com\/p\/original\/" target="_blank" rel="noopener noreferrer"/);
    assert.doesNotMatch(html,/Camila|Thomas|Lucía|icon-brand-google/);
  }
  const google={...review,source:'google' as const};
  const render=(reviews:Review[])=>renderToStaticMarkup(createElement(ReviewsSection,{lang:'es',settings:DEFAULT.settings.reviews,reviews}));
  assert.match(render([google]),/Lo que dicen en Google/);
  assert.match(render([google,review]),/Lo que dicen nuestros alumnos/);
  assert.ok(render([review,google]).indexOf('data-source="google"')<render([review,google]).indexOf('data-source="instagram"'));
});
test('importación social: orden, campos y duplicados en el archivo y borrador',()=>{
  const comment={red:'Instagram',url_post:review.url,usuario:'alumna',texto:review.text.es,fecha:'2026-10-15',testimonio_candidato:false};
  const candidates=parseSocialComments([comment,{...comment,usuario:'@otro',red:'tiktok',testimonio_candidato:true},comment]);
  assert.equal(candidates[0].testimonio_candidato,true);
  let id=0;
  const added=importSocialComments([],candidates,()=> 'r-'+ ++id);
  assert.equal(added.length,2);assert.equal(added[0].source,'tiktok');assert.equal(added[0].author,'@otro');
  assert.equal(added[0].date,'2026-10');assert.equal(added[0].rating,5);assert.equal(added[0].hidden,false);
  assert.deepEqual(added[0].text,{es:review.text.es,en:'',fr:'',de:''});
  assert.equal(importSocialComments([review],candidates).length,1);
  assert.equal(importSocialComments(added,candidates).length,0);
  assert.throws(()=>parseSocialComments([{...comment,url_post:'javascript:alert(1)'}]));
});

test('HTML Google: primero, foto, autor enlazado, fecha relativa y atribución',()=>{
  const google:GoogleReviewsState={active:true,updatedAt:'2026-11-01T12:00:00Z',rating:4.8,count:42,placeUrl:'https://maps.google.com/?cid=1',stale:false,error:false,
    reviews:[{...review,id:'sync',source:'google',author:'Autor de Google',authorUrl:'https://maps.google.com/contrib/1',photoUrl:'https://lh3.googleusercontent.com/photo',relativeDate:'hace una semana'}]};
  const html=renderToStaticMarkup(createElement(ReviewsSection,{lang:'es',settings:DEFAULT.settings.reviews,reviews:[review],google}));
  assert.ok(html.indexOf('data-source="google"')<html.indexOf('data-source="instagram"'));
  assert.match(html,/src="https:\/\/lh3.googleusercontent.com\/photo"/);
  assert.match(html,/href="https:\/\/maps.google.com\/contrib\/1" target="_blank" rel="noopener noreferrer">Autor de Google/);
  assert.match(html,/hace una semana/);assert.match(html,/Reseñas de Google · Google Maps/);assert.match(html,/42 reseñas en Google/);
});

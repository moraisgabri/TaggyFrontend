<h1 align="center"><img width="300" src="src/assets/TAGGY_LOGO.png" />
<br>EcoCalc Frontend
</h1>
<p align="center">
Um dashboard para visualizar o impacto da taggy na preservação do ambiente.
</p>

## Funcionalidades:

- [x] **Gerenciamento de Veículos**: Nessa funcionalidade será possível inserir diferentes modelos de veículos, bem como suas variáveis (consumo, emissão de CO², etc), para as estimativas dos cĺaculos. A edição, leitura e exclusão dos registros também serão possíveis.
- [x] **Gerenciamento de Combustíveis**: Nessa funcionalidade será possível inserir os diferentes tipos de combustíveis (etanol, gasolina, diesel e GNV) para que os cálculos de rendimento sejam mais precisos e adequados aos diferentes motores dos diferentes veículos. Além do cadastro também será possivel: editar, ler e excluir os registros.
- [x] **Calculadora de Emissões**: Através dos dados inseridos dos veículos (tipo de motor, consumo, e nível de emissões) associados aos rendimentos dos combustíveis no referidos veículos, o sistema fará um cálculo de emissões em um intervalo de tempo determinado em uma outra funcionalidade.
- [x] **Calculadora de Resíduos**: Levando em consideração o cupom padrão (de 8,0x7,5cm no pedágio para Porto), e tendo em mente uma estatística de que metade dos transeuntes que passam por um pedágio não solicitam o referido cupon, relacionando esse padrão a uma média de veículos que circulam em um único pedágio com ?? cancelas, a calculadora computará em Kg o montante de lixo produzido com o descarte desses cupons fiscais.
- [x] **Alternador de escala temporal**: Nesse vetor do sistema, será aplicada a variável de tempo que irá influenciar as demais variáveis e pode ser editada para escalonar a amostragem dos benefícios do RFID da Taggy.
- [ ] **Gráficos**: Gráficos de dois vetores, no formato “candlestick”. Isso facilitará, por exemplo, a diminuição das emissões de CO², ou a economia de combustível, ou mesmo a quantitativo de lixo produzido, com e sem o uso da Taggy.
- [ ] **Compilador de Resultados**: Possibilita exportar os diversos dados e variáveis relacionadas de forma padronizada e editável.

## Tecnologias

<div>
  <img width="50" src="https://pics.freeicons.io/uploads/icons/png/19108918321553750384-512.png" /> ReactJs &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img width="50" src="https://tanstack.com/images/logos/logo-color-100.png" /> Tanstack &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img width="50" src="https://images.seeklogo.com/logo-png/46/1/radix-ui-logo-png_seeklogo-466038.png" /> 
  Radix &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</div>

## Diagrama do banco de dados:

<img width="985" height="969" alt="Taggy" src="https://github.com/user-attachments/assets/75cc535b-1fa1-4452-982f-0ec6c3808fb7" />

[ou acesse o dbdiagram diretamente](https://dbdiagram.io/d/Taggy-69d3855b80896296842933f0)

# Fluxograma do usuário:

![Taggy (2)](https://github.com/user-attachments/assets/26c43af9-448f-445c-85ad-f3612905f185)
[ou acesse o Miro diretamente](https://miro.com/app/board/uXjVGmkk5Ko=/?share_link_id=800586848007)

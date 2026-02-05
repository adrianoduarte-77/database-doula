# Memory: technical/ux/scroll-to-top-standard
Updated: now

Para garantir a continuidade e clareza da experiência, o sistema realiza um reposicionamento automático no topo da página (scroll to top) em todas as seguintes situações:

1. **Transições de Step**: Ao avançar ou retroceder entre passos em fluxos guiados (Stage4Guide, GupyGuide, formulários de CV/Carta)
2. **Entrada em Etapas**: Ao navegar para qualquer página de etapa da mentoria (Stage3Page, Stage4Page, Stage5Page, Stage6Page, Stage7Page)
3. **Seleção de Documento**: Ao escolher um tipo de documento (ATS, Personalizado, Carta) no CVSelector
4. **Geração de Conteúdo**: Após a conclusão bem-sucedida da geração de CVs (ATS e Personalizado) e Cartas de Apresentação via IA

**Implementação Técnica:**
- Páginas de Stage: `useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);` no mount
- Step Navigation: `window.scrollTo({ top: 0, behavior: 'smooth' });` dentro do useEffect que monitora `currentStep`
- Content Generation: `window.scrollTo({ top: 0, behavior: 'smooth' });` chamado junto com `setViewState("preview")`

Esta regra aplica-se globalmente para evitar que o usuário comece uma nova etapa ou visualize um documento gerado no meio ou fim da tela devido ao scroll anterior.
